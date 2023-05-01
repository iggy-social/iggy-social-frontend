<template>
  <div>
    <p class="text-center">
      Claim {{ $config.tokenSymbol }} rewards for the previous period.
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        {{ $config.tokenSymbol }}
      </button>

      <input 
        v-model="claimAmount"
        type="text" 
        class="form-control"
        disabled
      >
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button 
        :disabled="waiting"
        class="btn btn-outline-primary" 
        type="button"
        @click="claim"
      >
        <span v-if="loadingStakingData || waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Claim
      </button>
    </div>

    <hr>

    <h4 class="text-center">Stats</h4>

    <ul>
      <li>Previous period end date: {{ lastPeriodDateTime }}</li>
    </ul>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";

export default {
  name: 'StakingClaim',
  props: ["loadingStakingData", "claimAmountWei", "lastClaimPeriod", "periodLength", "stakingContractAddress"],
  emits: ["clearClaimAmount"],

  data() {
    return {
      waiting: false
    }
  },

  computed: {
    claimAmount() {
      if (this.claimAmountWei === null || this.claimAmountWei === undefined || this.claimAmountWei === "" || this.claimAmountWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.claimAmountWei));
    },

    lastPeriodDateTime() {
      if (this.lastClaimPeriod === null || this.lastClaimPeriod === undefined || this.lastClaimPeriod === "" || this.lastClaimPeriod == 0) {
        return null;
      };

      const d = new Date(this.lastClaimPeriod * 1000);
      const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);

      return d.getDate()  + " " + month + " " + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes().toString().padStart(2, '0');
    }
  },

  methods: {
    async claim() {
      this.waiting = true;

      // set up staking contract
      const stakingContractInterface = new ethers.utils.Interface([
        "function claimRewards() external returns (uint256)"
      ]);

      const stakingContract = new ethers.Contract(
        this.stakingContractAddress,
        stakingContractInterface,
        this.signer
      );

      try {
        const tx = await stakingContract.claimRewards();

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
          this.$emit("clearClaimAmount"); // clear claim amount in parent component

          this.toast.dismiss(toastWait);

          this.toast("You have successfully claimed rewards!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waiting = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.toast(e.message, {type: "error"});
        this.waiting = false;
      }
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