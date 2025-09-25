<template>
  <div
    class="modal fade"
    id="changeUsernameModal"
    aria-labelledby="changeUsernameModalLabel"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="changeUsernameModalLabel">Change your username</h1>
          <button
            id="closeChangeUsernameModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="handleCloseClick"
          ></button>
        </div>
        <div class="modal-body">
          <p>Enter your new main username (you must own it):</p>

          <div class="input-group mb-3">
            <input type="text" class="form-control text-end" placeholder="enter name" v-model="domainName" />
            <span class="input-group-text">{{ $config.public.tldName }}</span>
          </div>

          <p v-if="domainNotValid.invalid && domainNotValid.message" class="text-danger">
            <small> <i class="bi bi-exclamation-octagon"></i> {{ domainNotValid.message }} </small>
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button
            type="button"
            :disabled="loading || domainNotValid.invalid"
            class="btn btn-primary"
            @click="changeUsername"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast'

import { useAccountData } from '@/composables/useAccountData'

import { storeUsername } from '@/utils/browserStorageUtils'
import { writeData } from '@/utils/contractUtils'
import { getDomainHolder, validateDomainName } from '@/utils/domainUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'ChangeUsernameModal',

  data() {
    return {
      domainName: null,
      fullDomainName: null,
      loading: false,
    }
  },

  computed: {
    domainNotValid() {
      return validateDomainName(this.domainName)
    },
  },

  methods: {
    async changeUsername() {
      this.loading = true
      this.fullDomainName = this.domainName + this.$config.public.tldName

      if (this.isConnected && !this.domainNotValid.invalid) {
        // check if the domain is owned by the user
        const domainHolder = await getDomainHolder(this.domainName)
        if (String(domainHolder).toLowerCase() !== String(this.address).toLowerCase()) {
          this.toast('You do not own this domain.', { type: 'error' })
          this.loading = false
          return
        }

        // TLD contract ABI for editDefaultDomain function
        const tldAbi = [
          {
            inputs: [{ name: '_domainName', type: 'string' }],
            name: 'editDefaultDomain',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
          }
        ]

        let toastWait;

        try {
          // Call the contract using writeData from utils/contractUtils
          const hash = await writeData({
            address: this.$config.public.punkTldAddress,
            abi: tldAbi,
            functionName: 'editDefaultDomain',
            args: [this.domainName.toLowerCase()] // domain name
          })

          toastWait = this.toast(
            {
              component: WaitingToast,
              props: {
                text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
              },
            },
            {
              type: 'info',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
            },
          )

          // Wait for transaction receipt using waitForTxReceipt from utils/contractUtils
          const receipt = await waitForTxReceipt(hash)

          if (receipt.status === 'success') {
            this.toast.dismiss(toastWait)
            this.fetchUserDomain() // update the main username in this app
            this.toast('You have successfully changed your username!', {
              type: 'success',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
            })
            this.loading = false
            document.getElementById('closeChangeUsernameModal').click()
          } else {
            this.toast.dismiss(toastWait)
            this.toast('Transaction has failed.', {
              type: 'error',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
            })
            this.loading = false
            console.log(receipt)
          }
        } catch (e) {
          try {
            let extractMessage = e.message.split('Details:')[1]
            extractMessage = extractMessage.split('Version: viem')[0]
            extractMessage = extractMessage.replace(/"/g, "");
            extractMessage = extractMessage.replace('execution reverted:', "Error:");

            console.log(extractMessage);
            
            this.toast(extractMessage, {type: "error"});
          } catch (e) {
            this.toast("Transaction has failed.", {type: "error"});
          }
          this.loading = false
          return
        } finally {
        this.toast.dismiss(toastWait)
        this.loading = false
        }
      }
    },

    async fetchUserDomain() {
      // Use the composable to set the domain name
      this.setDomainName(this.fullDomainName)
      storeUsername(window, this.address, this.fullDomainName)
    },

    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeChangeUsernameModal')
      if (closeButton) {
        closeButton.blur()
      }
    },
  },

  setup() {
    const toast = useToast()
    
    const config = useConfig()
    const { address, isConnected } = useAccount({ config })
    
    const { setDomainName } = useAccountData()
    
    return { 
      address, 
      isConnected, 
      toast, 
      setDomainName
    }
  },
}
</script>
