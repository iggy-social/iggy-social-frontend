<template>
  <!-- Modal -->
  <div
    class="modal fade"
    :id="'changeImageModal' + componentId"
    :aria-labelledby="'changeImageModalLabel' + componentId"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'changeImageModalLabel' + componentId">Change your profile picture</h1>
          <button
            :id="'closeChangeImageModal' + componentId"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="handleCloseClick"
          ></button>
        </div>

        <div class="modal-body mb-4">
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs nav-fill">
            <li class="nav-item">
              <button
                :disabled="!fileUploadEnabled"
                class="nav-link"
                :class="currentTab === 'upload' ? 'active' : ''"
                @click="currentTab = 'upload'"
              >
                Upload
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" :class="currentTab === 'paste' ? 'active' : ''" @click="currentTab = 'paste'">
                Paste Link
              </button>
            </li>
          </ul>
          <!-- END Tabs Navigation -->

          <!-- Tabs Content -->
          <div class="tab-content mt-3">
            <!-- Upload Tab -->
            <div v-if="currentTab === 'upload'">
              <p>Upload your new profile image {{ domainName }}.</p>

              <FileUploadInput
                btnCls="btn btn-primary"
                :maxFileSize="$config.public.fileUploadSizeLimit"
                :storageType="storageType"
                @processUploadedFileUrl="processUploadedFileUrl"
              />
            </div>

            <!-- Paste Link Tab -->
            <div v-if="currentTab === 'paste'">
              <p>Submit the image link to blockchain</p>

              <input v-model="imageLink" type="text" class="form-control mb-3" placeholder="Enter http link to file" />

              <div v-if="imageLink" class="mb-3">
                <Image :url="imageLink" cls="img-thumbnail img-fluid" style="max-width: 100px" />
                <small
                  >If image didn't appear above, then something is wrong with the link you added (wait until the loading
                  indicator completes).</small
                >
              </div>

              <button v-if="isConnected && isSupportedChain" class="btn btn-primary" @click="submitToBlockchain" :disabled="!imageLink || waitingSubmit">
                <span v-if="waitingSubmit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submit to blockchain
              </button>

              <ConnectWalletButton v-if="!isConnected" class="btn-outline-primary mt-2 mb-2" btnText="Connect Wallet" />
              <SwitchChainButton v-if="isConnected && !isSupportedChain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import ConnectWalletButton from '@/components/connect/ConnectWalletButton'
import Image from '@/components/Image.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import WaitingToast from '@/components/WaitingToast'
import FileUploadInput from '@/components/storage/FileUploadInput.vue'
import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'ChangePfpModal',
  props: ['componentId', 'domainName', 'storageType'],
  emits: ['processFileUrl'],
  components: { ConnectWalletButton, FileUploadInput, Image, SwitchChainButton },

  data() {
    return {
      currentTab: 'upload',
      imageLink: null,
      waitingSubmit: false,
    }
  },

  mounted() {
    if (!this.fileUploadEnabled) {
      this.currentTab = 'paste'
    }
  },

  computed: {
    domainNameWithoutTld() {
      return this.domainName.replace(this.$config.public.tldName, '')
    },

    fileUploadEnabled() {
      return this.$config.public.fileUploadEnabled
    },

    isSupportedChain() {
      if (this.chainId === this.$config.public.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeChangeImageModal' + this.componentId)
      if (closeButton) {
        closeButton.blur()
      }
    },

    processUploadedFileUrl(fileUrl) {
      this.imageLink = fileUrl
      this.currentTab = 'paste'
    },

    async submitToBlockchain() {
      const toastWaitSign = this.toast({component: WaitingToast, props: {text: 'Please confirm the transaction.'}}, {type: 'info'})
      this.waitingSubmit = true

      let toastWait;

      try {
        // Get domain data first
        const domainDataResult = await readData({
          address: this.$config.public.punkTldAddress,
          abi: [
            {
              inputs: [{ name: '_domainName', type: 'string' }],
              name: 'getDomainData',
              outputs: [{ name: '', type: 'string' }],
              stateMutability: 'view',
              type: 'function'
            }
          ],
          functionName: 'getDomainData',
          args: [String(this.domainNameWithoutTld).toLowerCase()]
        })

        let domainData = {}
        
        if (domainDataResult) {
          try {
            domainData = JSON.parse(domainDataResult)
          } catch (e) {
            console.warn('Failed to parse domain data as JSON, using empty object:', e)
            domainData = {}
          }
        } else {
          console.log('No existing domain data found, creating new domain data for:', this.domainNameWithoutTld)
        }

        domainData['image'] = this.imageLink

        // Submit to blockchain
        const txHash = await writeData({
          address: this.$config.public.punkTldAddress,
          abi: [
            {
              inputs: [
                { name: '_domainName', type: 'string' },
                { name: '_data', type: 'string' }
              ],
              name: 'editData',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function'
            }
          ],
          functionName: 'editData',
          args: [
            String(this.domainNameWithoutTld).toLowerCase(),
            JSON.stringify(domainData)
          ]
        })

        this.toast.dismiss(toastWaitSign)

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
          },
        )

        // Wait for transaction receipt
        const receipt = await waitForTxReceipt(txHash)

        if (receipt.status === 'success') {
          this.waitingSubmit = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully changed your profile image!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
          })

          this.$emit('processFileUrl', this.imageLink)
          document.getElementById('closeChangeImageModal' + this.componentId).click()
        } else {
          this.waitingSubmit = false
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingSubmit = false
      } finally {
        this.toast.dismiss(toastWaitSign)
        this.toast.dismiss(toastWait)
        this.waitingSubmit = false
      }

      this.waitingSubmit = false
    },
  },

  setup() {
    const config = useConfig()
    const { isConnected, chainId } = useAccount({ config })
    const { fileUploadEnabled } = useSiteSettings()
    const toast = useToast()

    return {
      fileUploadEnabled,
      isConnected,
      chainId,
      toast,
    }
  },

  watch: {
    fileUploadEnabled() {
      if (!this.fileUploadEnabled) {
        this.currentTab = 'paste'
      } else {
        this.currentTab = 'upload'
      }
    },

    imageLink(oldValue, newValue) {
      if (newValue) {
        this.currentTab = 'paste'
      }
    },
  },
}
</script>
