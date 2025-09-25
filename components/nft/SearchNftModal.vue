<template>
  <div
    class="modal fade"
    id="searchNftModal"
    tabindex="-1"
    :aria-labelledby="'modalLabel-' + componentId"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-' + componentId">Find NFT collection</h1>
          <button
            :id="'closeModal-' + componentId"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <div class="mb-3">
            <label :for="'input-' + componentId" class="form-label">Enter NFT collection address or unique ID:</label>
            <input v-model="searchText" type="text" class="form-control" :for="'input-' + componentId" />
          </div>

          <p v-if="findError">Error: Collection not found...</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button @click="findNft" type="button" class="btn btn-primary" :disabled="waitingFind">
            <span v-if="waitingFind" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Find
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { readData } from '@/utils/contractUtils'
import { zeroAddress } from 'viem'

export default {
  name: 'SearchNftModal',

  data() {
    return {
      componentId: null,
      searchText: '',
      waitingFind: false,
      findError: false,
    }
  },

  mounted() {
    this.componentId = this.$.uid
  },

  methods: {
    async findNft() {
      this.waitingFind = true
      this.findError = false

      if (this.searchText) {
        if (String(this.searchText).toLowerCase().startsWith('0x')) {
          // close the modal
          document.getElementById('closeModal-' + this.componentId).click()

          this.$router.push({ path: '/nft/collection/', query: { id: this.searchText } })
          this.searchText = null

          return (this.waitingFind = false)
        } else {
          // search by unique ID
          try {
            const contractConfig = {
              address: this.$config.public.nftLaunchpadBondingAddress,
              abi: [
                {
                  name: 'getNftContractAddress',
                  type: 'function',
                  stateMutability: 'view',
                  inputs: [{ name: '_uniqueId', type: 'string' }],
                  outputs: [{ name: '', type: 'address' }]
                }
              ],
              functionName: 'getNftContractAddress',
              args: [this.searchText]
            }

            const nftAddress = await readData(contractConfig)

            if (nftAddress && nftAddress !== zeroAddress) {
              // close the modal
              document.getElementById('closeModal-' + this.componentId).click()

              this.$router.push({ path: '/nft/collection/', query: { id: nftAddress } })
              this.searchText = null

              return (this.waitingFind = false)
            }
          } catch (error) {
            console.error('Error finding NFT:', error)
          }
        }

        this.findError = true

        return (this.waitingFind = false)
      }
    },
  }
}
</script>
