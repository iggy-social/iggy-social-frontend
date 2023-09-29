<template>
  <div>
    <p class="text-center">
      Stake {{ $config.lpTokenSymbol }} to receive periodic staking rewards in {{ $config.tokenSymbol }} tokens 
      (min deposit: {{ minDeposit }} {{ $config.lpTokenSymbol }}). 
      <NuxtLink to="/post/?id=kjzl6cwe1jw147gcaq8o17j668j1vol8v4z0vmv0ris1g5qyqvmrxbn0bpif8wh">
        Learn more here.
      </NuxtLink>
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        {{ $config.lpTokenSymbol }}
      </button>

      <input 
        v-model="depositAmount"
        type="text" 
        class="form-control" 
        placeholder="0.00"
        :disabled="waitingApproval || waitingDeposit"
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
          {{ lpTokenBalance }} {{ $config.lpTokenSymbol }}
        </span>
      </em>
    </small>

    
    <div class="d-flex justify-content-center mt-4 mb-4">
      <!-- Approve token button -->
      <button 
        :disabled="waitingApproval || depositTooLow"
        v-if="allowanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
        @click="approveToken"
      >
        <span v-if="loadingStakingData || waitingApproval" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Approve token
      </button>

      <!-- Deposit button -->
      <button 
        :disabled="waitingDeposit || depositTooLow"
        v-if="!allowanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
        @click="deposit"
      >
        <span v-if="loadingStakingData || waitingDeposit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Stake
      </button>
    </div>

    <p class="text-center">
      <small class="text-center" v-if="allowanceTooLow">
        <em>
          You will need to do 2 transactions: Approve token and then Stake.
        </em>
      </small>
    </p>

    <hr class="mb-5" />

    <AddLiquidity />

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import AddLiquidity from '~/components/stake/AddLiquidity.vue';
import { useUserStore } from '~/store/user';

export default {
  name: 'StakingDeposit',
  props: ["loadingStakingData", "minDepositWei", "maxDepositWei", "lpTokenAllowanceWei", "lpTokenDecimals"],
  emits: ["clearClaimAmount", "subtractBalance", "updateAllowance"],

  data() {
    return {
      allowanceWei: 0,
      depositAmount: 0,
      waitingApproval: false,
      waitingDeposit: false
    }
  },

  components: {
    AddLiquidity
  },

  mounted() {
    this.allowanceWei = this.lpTokenAllowanceWei;
  },

  computed: {
    allowanceTooLow() {
      return Number(this.allowanceWei) < Number(this.depositAmountWei);
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return 0;
      }

      return ethers.utils.parseUnits(String(this.depositAmount), this.lpTokenDecimals);
    },

    depositTooLow() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return true;
      }

      return Number(this.depositAmountWei) < Number(this.minDepositWei);
    },

    lpTokenBalance() {
      return ethers.utils.formatUnits(this.userStore.getLpTokenBalanceWei, this.lpTokenDecimals);
    },

    minDeposit() {
      if (this.minDepositWei === null || this.minDepositWei === undefined || this.minDepositWei === "" || this.minDepositWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.minDepositWei));
    },
  },

  methods: {
    async approveToken() {
      this.waitingApproval = true;

      // set up staking token
      const lpTokenInterface = new ethers.utils.Interface([
        "function approve(address spender, uint256 amount) public returns (bool)"
      ]);

      const lpToken = new ethers.Contract(
        this.$config.lpTokenAddress,
        lpTokenInterface,
        this.signer
      );

      try {
        const tx = await lpToken.approve(this.$config.stakingContractAddress, this.depositAmountWei);

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
          this.$emit("updateAllowance", this.depositAmountWei);

          this.toast.dismiss(toastWait);

          this.toast("You have successfully approved tokens. Now proceed with staking!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.waitingApproval = false;

          this.deposit();
        } else {
          this.toast.dismiss(toastWait);
          this.waitingApproval = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.waitingApproval = false;
      }
    },

    async deposit() {
      this.waitingDeposit = true;

      // set up staking contract
      const stakingContractInterface = new ethers.utils.Interface([
        "function deposit(uint256 _assets) external returns (uint256)"
      ]);

      const stakingContract = new ethers.Contract(
        this.$config.stakingContractAddress,
        stakingContractInterface,
        this.signer
      );

      try {
        const tx = await stakingContract.deposit(this.depositAmountWei);

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
          this.$emit("updateAllowance", 0); // reset allowance
          this.$emit("subtractBalance", this.depositAmountWei);
          this.$emit("clearClaimAmount"); // clear claim amount in parent component

          this.toast.dismiss(toastWait);

          this.toast("You have successfully staked tokens!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.waitingDeposit = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingDeposit = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.toast(e.message, {type: "error"});
        this.waitingDeposit = false;
      }
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.lpTokenBalance;
    },
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return {
      signer,
      toast,
      userStore
    }
  },

  watch: {
    lpTokenAllowanceWei() {
      this.allowanceWei = this.lpTokenAllowanceWei;
    }
  }

}
</script>