<template>
  <div class="input-group mb-3" v-if="address" @click="copyToClipboard">
    <input
      v-model="getReferralLink"
      type="text"
      class="form-control cursor-pointer"
      aria-label="Recipient's username"
      aria-describedby="basic-addon2"
      readonly
    />

    <button class="btn btn-outline-secondary" type="button" id="button-addon2" title="Copy to clipboard">
      <i v-if="!copied" class="bi bi-clipboard"></i>
      <i v-if="copied" class="bi bi-clipboard-check"></i>
    </button>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import { getTextWithoutBlankCharacters } from '@/utils/textUtils'
import { useAccountData } from '@/composables/useAccountData'

export default {
  name: 'ShareReferralLink',

  data() {
    return {
      copied: false,
    }
  },

  computed: {
    getDomainNameOrAddress() {
      if (this.domainName) {
        return getTextWithoutBlankCharacters(this.domainName)
      }

      return this.address
    },

    getReferralLink() {
      if (this.route.fullPath.includes('?')) {
        return window.location.origin + this.route.fullPath + `&ref=${this.getDomainNameOrAddress}`
      }

      return window.location.origin + this.route.fullPath + `?ref=${this.getDomainNameOrAddress}`
    },
  },

  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.getReferralLink)
      this.copied = true
      this.toast('Referral link copied to your clipboard!', { type: 'success' })
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })
    const { domainName } = useAccountData()
    const toast = useToast()
    const route = useRoute()

    return { 
      address,
      domainName,
      toast,
      route
    }
  },
}
</script>
