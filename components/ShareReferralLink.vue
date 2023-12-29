<template>
<div class="input-group mb-3" v-if="address" @click="copyToClipboard">
  <input 
    v-model="getReferralLink"
    type="text" class="form-control cursor-pointer" 
    aria-label="Recipient's username" aria-describedby="basic-addon2" 
    readonly 
  />
  
  <button class="btn btn-outline-secondary" type="button" id="button-addon2">
    <i v-if="!copied" class="bi bi-clipboard"></i>
    <i v-if="copied" class="bi bi-clipboard-check"></i>
  </button>
</div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import { useUserStore } from '~/store/user';
import { getTextWithoutBlankCharacters } from '~/utils/textUtils';

export default {
  name: "ShareReferralLink",

  data() {
    return {
      copied: false
    }
  },

  computed: {
    getDomainNameOrAddress() {
      if (this.userStore.getDefaultDomain) {
        return getTextWithoutBlankCharacters(this.userStore.getDefaultDomain);
      }

      return this.address;
    },

    getReferralLink() {
      if (this.$route.href.includes("?")) {
        return window.location.origin + this.$route.href + `&ref=${this.getDomainNameOrAddress}`;
      }

      return window.location.origin + this.$route.href + `?ref=${this.getDomainNameOrAddress}`;
    }
  },

  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.getReferralLink);
      this.copied = true;
      this.toast("Referral link copied to your clipboard!", {type: "success"});
    }
  },

  setup() {
    const { address } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return { address, toast, userStore }
  },
}
</script>