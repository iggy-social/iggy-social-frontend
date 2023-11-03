<template>
  <div>
    <p class="text-center">
      Claim {{ domainChatReward }} {{ $config.chatTokenSymbol }} airdrop for each {{ $config.tldName }} domain that you hold.
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <input 
        v-model="domainName"
        type="text" 
        placeholder="Enter domain name"
        class="form-control"
      >

      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ $config.tldName }}
      </button>
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button 
        :disabled="waiting || loadingData || !domainName"
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
        Note that someone else can claim tokens (for a given domain) for you and save you on gas fees. You will still receive the 
        same amount of {{ $config.chatTokenSymbol }} tokens as if you've made the claim yourself.
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
  name: 'AirdropDomainHolders',
  props: [ "domainChatRewardWei", "loadingData" ],

  data() {
    return {
      domainName: null,
      waiting: false
    }
  },

  computed: {
    domainChatReward() {
      return Math.floor(Number(ethers.utils.formatEther(this.domainChatRewardWei)));
    }
  },

  methods: {
    async claim() {
      this.waiting = true;

      const cleanDomainName = this.domainName.replace(this.$config.tldName, "").trim().toLowerCase();
      console.log(cleanDomainName);

      const chatTokenClaimDomainsInterface = new ethers.utils.Interface([
        "function claim(string calldata _domainName) external"
      ]);

      const chatTokenClaimDomainsContract = new ethers.Contract(
        this.$config.airdropClaimDomainsAddress,
        chatTokenClaimDomainsInterface,
        this.signer
      );

      try {
        const tx = await chatTokenClaimDomainsContract.claim(cleanDomainName);

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

          this.toast("Airdrop for " + cleanDomainName + this.$config.tldName + " has been successfully claimed!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.userStore.addToChatTokenBalanceWei(this.domainChatRewardWei);

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
          extractMessage = extractMessage.replace(/"/g, "");
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