<template>
  <div
    class="modal fade"
    id="changeCollectionPreviewModal"
    tabindex="-1"
    :aria-labelledby="'modalLabel-' + componentId"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-' + componentId">Change Collection Preview Image</h1>
          <button
            :id="'closeModal-' + componentId"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <p>Change your collection preview image.</p>

          <div class="mt-4">
            <div v-if="!imageUrl && $config.public.fileUploadEnabled">
              <p>Upload new image (and then click Submit below):</p>

              <FileUploadInput
                btnCls="btn btn-primary"
                :storageType="$config.public.fileUploadStorageType"
                :maxFileSize="$config.public.fileUploadSizeLimit"
                @processUploadedFileUrl="insertImageLink"
              />

              <p class="mt-3">Or paste image link here:</p>
            </div>

            <p v-if="!$config.public.fileUploadEnabled">Paste image link here:</p>

            <input v-model="imageUrl" type="text" class="form-control" />

            <div v-if="imageUrl" class="mt-3">
              <Image :url="imageUrl" cls="img-thumbnail img-fluid" style="max-width: 100px" />
              <br />
              <small
                >If image didn't appear above, then something is wrong with the link you added (wait until the loading
                indicator completes). If you have an IPFS link, it also helps to cut/paste the same link a couple of
                times.</small
              >
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="updateImage" type="button" class="btn btn-primary" :disabled="!imageUrl || waiting">
            <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Submit to blockchain
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import Image from '@/components/Image.vue'
import WaitingToast from '@/components/WaitingToast'
import FileUploadInput from '@/components/storage/FileUploadInput.vue'

import { writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'ChangeCollectionPreviewModal',
  props: ['cAddress', 'mdAddress'],
  emits: ['saveCollection'],
  components: { FileUploadInput, Image },

  data() {
    return {
      componentId: null,
      imageUrl: null,
      waiting: false,
    }
  },

  mounted() {
    this.componentId = this.$.uid
  },

  methods: {
    async updateImage() {
      if (!this.isConnected) {
        this.toast('Please connect your wallet first.', { type: 'error' })
        return
      }

      this.waiting = true

      let toastWait;

      try {
        // Contract configuration for the write operation
        const contractConfig = {
          address: this.mdAddress,
          abi: [
            {
              name: 'setCollectionPreview',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'nftAddress_', type: 'address' },
                { name: 'collectionPreview_', type: 'string' }
              ],
              outputs: []
            }
          ],
          functionName: 'setCollectionPreview',
          args: [this.cAddress, this.imageUrl]
        }

        // Write the transaction
        const hash = await writeData(contractConfig)

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

        // Wait for transaction receipt
        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.toast('You have updated the NFT collection preview image.', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.$emit('saveCollection', {
            image: this.imageUrl,
          })

          this.imageUrl = null

          // close the modal
          document.getElementById('closeModal-' + this.componentId).click()

          this.waiting = false
        } else {
          this.toast.dismiss(toastWait)
          this.waiting = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
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

        this.waiting = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waiting = false
      }
    },

    insertImageLink(fileUrl) {
      this.imageUrl = fileUrl
    },
  },

  setup() {
    const config = useConfig()
    const { isConnected } = useAccount({ config })
    const toast = useToast()

    return { 
      isConnected, 
      toast 
    }
  },
}
</script>
