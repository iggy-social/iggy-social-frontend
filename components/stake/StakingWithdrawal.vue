<template>
  <div>
    <p class="text-center">
      Withdraw/unstake {{ $config.stakingTokenSymbol }} (it will also auto-claim any remaining rewards).
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        LP tokens
      </button>

      <input 
        v-model="withdrawalAmount"
        type="text" 
        class="form-control" 
        placeholder="0.00"
        :disabled="waitingWithdrawal"
      >

      <button
        @click="setMaxInputTokenAmount" 
        class="btn btn-outline-secondary" 
        type="button" id="button-addon2"
      >
        <small>MAX</small>
      </button>
    </div>

    <!-- Token balance -->
    <small class="text-muted">
      <em>
        Balance: 
        <span class="cursor-pointer hover-color" @click="setMaxInputTokenAmount">
          {{ receiptTokenBalance }} staked tokens
        </span>
      </em>
    </small>

    <!-- Withdraw button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button 
        :disabled="waitingWithdrawal || withdrawalIncorrect.error || isWithdrawalAmountNullOrEmpty"
        class="btn btn-outline-primary" 
        type="button"
        @click="withdrawal"
      >
        <span v-if="loadingStakingData || waitingWithdrawal" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Withdraw
      </button>
    </div>

    <div v-if="withdrawalIncorrect.error" class="alert alert-warning text-center" role="alert">
      {{ withdrawalIncorrect.message }}
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";

export default {
  name: 'StakingWithdrawal',
  props: [
    "loadingStakingData", "lockedTimeLeft", "minDepositWei", "receiptTokenBalanceWei", "stakingContractAddress", 
    "stakingTokenAddress", "stakingTokenDecimals"
  ],
  emits: ["addBalance"],

  data() {
    return {
      withdrawalAmount: 0,
      waitingWithdrawal: false
    }
  },

  computed: {
    isWithdrawalAmountNullOrEmpty() {
      return this.withdrawalAmount === null || this.withdrawalAmount === "" || this.withdrawalAmount == 0 || Number(this.withdrawalAmount) === 0;
    },

    lockedSecondsHumanReadable() {
      // return lockedTimeLeft (in seconds) in human readable format (minutes, hours, days)
      const seconds = Number(this.lockedTimeLeft);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days+1} days`;
      }

      if (hours > 0) {
        return `${hours+1} hours`;
      }

      if (minutes > 0) {
        return `${minutes+1} minutes`;
      }

      return `${seconds+1} seconds`;
    },

    minDeposit() {
      return ethers.utils.formatUnits(String(this.minDepositWei), Number(this.stakingTokenDecimals));
    },

    receiptTokenBalance() {
      return ethers.utils.formatEther(String(this.receiptTokenBalanceWei));
    },

    withdrawalAmountWei() {
      if (!this.withdrawalAmount || Number(this.withdrawalAmount) === 0) {
        return 0;
      }

      return ethers.utils.parseEther(String(this.withdrawalAmount));
    },

    withdrawalIncorrect() {
      // tokens are locked
      if (Number(this.lockedTimeLeft) > 0) {
        return {
          error: true,
          message: "Your staked tokens are still locked for " + this.lockedSecondsHumanReadable + "."
        };
      }

      // amount is too high
      if (Number(this.withdrawalAmountWei) > Number(this.receiptTokenBalanceWei)) {
        return {
          error: true,
          message: "The amount exceeds your staked token balance."
        };
      }

      if (Number(this.withdrawalAmountWei) < Number(this.receiptTokenBalanceWei)) {
        const remainingStakedAmountWei = Number(this.receiptTokenBalanceWei) - Number(this.withdrawalAmountWei);

        if (Number(remainingStakedAmountWei) < Number(this.minDepositWei)) {
          return {
            error: true,
            message: "You cannot withdraw this amount because the staked balance left will be less than the minimum required deposit amount (" + String(Number(this.minDeposit)) + " tokens)."
          };
        }
      }

      // everything is fine
      return {
        error: false,
        message: ""
      };
    }
  },

  methods: {
    async withdrawal() {
      this.waitingWithdrawal = true;

      // set up staking contract
      const stakingContractInterface = new ethers.utils.Interface([
        "function withdraw(uint256 _assets) external returns (uint256)"
      ]);

      const stakingContract = new ethers.Contract(
        this.stakingContractAddress,
        stakingContractInterface,
        this.signer
      );

      try {
        const tx = await stakingContract.withdraw(this.withdrawalAmountWei);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.$emit("addBalance", this.withdrawalAmountWei); // add balance to (unstaked) tokens

          this.toast.dismiss(toastWait);

          this.toast("You have successfully unstaked tokens!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.waitingWithdrawal = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingWithdrawal = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.toast(e.message, {type: "error"});
        this.waitingWithdrawal = false;
      }
    },

    setMaxInputTokenAmount() {
      this.withdrawalAmount = this.receiptTokenBalance;
    },
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();

    return {
      address,
      signer,
      toast
    }
  }

}
</script>