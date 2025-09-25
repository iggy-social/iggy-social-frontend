<template>
  <div
    class="modal fade"
    id="changeDescriptionModal"
    tabindex="-1"
    :aria-labelledby="'modalLabel-' + componentId"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-' + componentId">Change description</h1>
          <button
            :id="'closeModal-' + componentId"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <p>Change your collection description.</p>

          <div class="mt-4">
            <label :for="'input-' + componentId" class="form-label">
              <strong> Enter new description: </strong>
            </label>

            <input v-model="editDescription" type="text" class="form-control" :id="'input-' + componentId" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button @click="update" type="button" class="btn btn-primary" :disabled="!editDescription || waiting">
            <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'

import WaitingToast from '@/components/WaitingToast'

import { writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'ChangeDescriptionModal',
  props: ['cAddress', 'cDescription', 'mdAddress'],
  emits: ['saveCollection'],

  data() {
    return {
      componentId: null,
      editDescription: null,
      waiting: false,
    }
  },

  mounted() {
    this.componentId = this.$.uid
    this.editDescription = this.cDescription
  },

  methods: {
    async update() {
      this.waiting = true

      let toastWait;

      try {
        // Call the smart contract using writeData
        const hash = await writeData({
          address: this.mdAddress,
          abi: [
            {
              name: 'setDescription',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'nftAddress_', type: 'address' },
                { name: 'description_', type: 'string' }
              ],
              outputs: []
            }
          ],
          functionName: 'setDescription',
          args: [
            this.cAddress,
            this.editDescription.replace(/"/g, "'") // replace double quotes with single quotes
          ]
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

        // Wait for transaction receipt
        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.toast('You have updated the NFT description.', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.$emit('saveCollection', {
            description: this.editDescription.replace(/"/g, "'"), // replace double quotes with single quotes
          })

          this.editDescription = null

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
  },

  setup() {
    const toast = useToast()

    return { 
      toast 
    }
  },

  watch: {
    cDescription() {
      this.editDescription = this.cDescription
    },
  },
}
</script>
