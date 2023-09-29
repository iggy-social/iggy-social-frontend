<template>
  <div>
    <p class="text-center">
      Claim {{ airdropPostMinting }} {{ $config.chatTokenSymbol }} airdrop for doing post minting in the past.
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <input 
        v-model="airdropPostMinting"
        type="text"
        class="form-control" 
        disabled
      >

      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ $config.chatTokenSymbol }}
      </button>
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button 
        :disabled="waiting || loadingData || airdropPostMinting == 0"
        class="btn btn-outline-primary" 
        type="button"
        @click="claim"
      >
        <span v-if="loadingData || waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Claim
      </button>
    </div>

    <hr />

    <p class="text-center">
      <small>
        If you're not eligible, or have already claimed the airdrop, the amount of {{ $config.chatTokenSymbol }} tokens shown is 0.
      </small>
    </p>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { useUserStore } from '~/store/user';

export default {
  name: 'AirdropPostMinters',
  props: [ "airdropPostMintingWei", "loadingData" ],
  emits: [ "setDomainChatRewardWeiToZero" ],

  data() {
    return {
      waiting: false
    }
  },

  computed: {
    airdropPostMinting() {
      return Math.floor(Number(ethers.utils.formatEther(this.airdropPostMintingWei)));
    }
  },

  methods: {
    async claim() {
      this.waiting = true;

      const claimPostMintersInterface = new ethers.utils.Interface([
        "function claim() external"
      ]);

      const claimPostMintersContract = new ethers.Contract(
        this.$config.airdropPostMintersAddress,
        claimPostMintersInterface,
        this.signer
      );

      try {
        const tx = await claimPostMintersContract.claim();

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
          this.toast.dismiss(toastWait);

          this.userStore.addToChatTokenBalanceWei(this.airdropPostMintingWei);

          this.$emit("setDomainChatRewardWeiToZero");

          this.toast("Airdrop for minting posts in the past has been successfully claimed!", {
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

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");
          extractMessage = extractMessage.replace('ChatTokenClaimDomains: ', "");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

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