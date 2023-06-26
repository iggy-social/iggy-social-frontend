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
        <span v-if="!lastPeriodUpdateNeeded">Claim</span>
        <span v-if="lastPeriodUpdateNeeded">Update Claim Period</span>
      </button>
    </div>

    <hr>

    <h4 class="text-center">Stats</h4>

    <ul>
      <li>Previous period rewards: {{ claimRewardsTotal }} {{ $config.tokenSymbol }}</li>
      <li>Previous period end date: {{ lastPeriodDateTime }}</li>
      <li>Period length: {{ periodLengthHumanReadable }}</li>
      <li>This period rewards: {{ futureRewards }} {{ $config.tokenSymbol }} (so far)</li>
      <li>Min stake: {{ minDeposit }} {{ $config.lpTokenSymbol }}</li>
      <li>Your stake: {{ stakeTokenBalance }} {{ $config.lpTokenSymbol }}</li>
    </ul>

    <!-- START @TODO: check if needed -->
    <GenericNftDrop 
      title="Claim the NFT for Early Stakers" 
      description="Early stakers can claim this free commemorative NFT. Hurry up, limited time only!"
      :claimersData="claimers" 
      merkleClaimerAddress="0x5E09AF1510c651787101cE57baFB735bC48005Af" 
      nftImage="https://bafybeic3fpbvtqj6kqpu77vy56efkasgbaviguc3qm4jgy3dy7fuk7fire.ipfs.w3s.link/early-staker-nft-sgb-chat.png"
    />
    <!-- // END @TODO: check if needed -->
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { useUserStore } from '~/store/user';
import GenericNftDrop from "~/components/merkle/genericNftDrop"; // @TODO: check if needed
import earlyStakers from "~/assets/merkle/earlyStakers.json"; // @TODO: check if needed

export default {
  name: 'StakingClaim',
  props: [
    "loadingStakingData", "claimAmountWei", "claimRewardsTotalWei", "futureRewardsWei", "lastClaimPeriod", "minDepositWei", 
    "periodLength"
  ],
  emits: ["clearClaimAmount", "updateLastClaimPeriod"],

  data() {
    return {
      claimers: [], // @TODO: check if needed
      waiting: false
    }
  },

  components: {
    GenericNftDrop, // @TODO: check if needed
    WaitingToast
  },

  created() {
    this.claimers = earlyStakers; // @TODO: check if needed
  },

  computed: {
    claimAmount() {
      if (this.claimAmountWei === null || this.claimAmountWei === undefined || this.claimAmountWei === "" || this.claimAmountWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.claimAmountWei));
    },

    claimRewardsTotal() {
      if (this.claimRewardsTotalWei === null || this.claimRewardsTotalWei === undefined || this.claimRewardsTotalWei === "" || this.claimRewardsTotalWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.claimRewardsTotalWei));
    },

    futureRewards() {
      if (this.futureRewardsWei === null || this.futureRewardsWei === undefined || this.futureRewardsWei === "" || this.futureRewardsWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.futureRewardsWei));
    },

    lastPeriodDateTime() {
      if (this.lastClaimPeriod === null || this.lastClaimPeriod === undefined || this.lastClaimPeriod === "" || this.lastClaimPeriod == 0) {
        return null;
      };

      const d = new Date(this.lastClaimPeriod * 1000);
      const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);

      return d.getDate()  + " " + month + " " + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes().toString().padStart(2, '0');
    },

    lastPeriodUpdateNeeded() {
      if (this.lastClaimPeriod === null || this.lastClaimPeriod === undefined || this.lastClaimPeriod === "" || this.lastClaimPeriod == 0) {
        return false;
      };

      const now = Math.floor(Date.now() / 1000);

      if (now - (Number(this.lastClaimPeriod)+Number(this.periodLength)) > 0) {
        // last claim period is more than the period length ago, so we need to update the claim period
        return true;
      }
      
      return false;
    },

    minDeposit() {
      if (this.minDepositWei === null || this.minDepositWei === undefined || this.minDepositWei === "" || this.minDepositWei == 0) {
        return 0;
      };

      return ethers.utils.formatEther(String(this.minDepositWei));
    },

    periodLengthHumanReadable() {
      if (this.periodLength === null || this.periodLength === undefined || this.periodLength === "" || this.periodLength == 0) {
        return null;
      };

      // return period length (in seconds) in human readable format (minutes, hours, days)
      const seconds = Number(this.periodLength);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} days`;
      }

      if (hours > 0) {
        return `${hours} hours`;
      }

      if (minutes > 0) {
        return `${minutes} minutes`;
      }

      return `${seconds} seconds`;
    },

    stakeTokenBalance() {
      return ethers.utils.formatEther(this.userStore.getStakeTokenBalanceWei);
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
        this.$config.stakingContractAddress,
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
          this.$emit("updateLastClaimPeriod"); // update last claim period in parent component

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
    }
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return {
      address,
      signer,
      toast,
      userStore
    }
  }

}
</script>