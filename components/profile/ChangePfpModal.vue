<template>
  <!-- Modal -->
  <div
    class="modal fade"
    :id="'changeImageModal' + componentId"
    tabindex="-1"
    :aria-labelledby="'changeImageModalLabel' + componentId"
    aria-hidden="true"
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
          ></button>
        </div>

        <div class="modal-body mb-4">
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs nav-fill">
            <li class="nav-item">
              <button
                :disabled="!this.fileUploadEnabled"
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
                :maxFileSize="$config.fileUploadSizeLimit"
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

              <button v-if="isActivated && isSupportedChain" class="btn btn-primary" @click="submitToBlockchain" :disabled="!imageLink || waitingSubmit">
                <span v-if="waitingSubmit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submit to blockchain
              </button>

              <ConnectWalletButton v-if="!isActivated" class="btn btn-outline-primary mt-2 mb-2" btnText="Connect Wallet" />
              <SwitchChainButton v-if="isActivated && !isSupportedChain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import ConnectWalletButton from '~/components/ConnectWalletButton'
import Image from '~/components/Image.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import FileUploadInput from '~/components/storage/FileUploadInput.vue'
import { useEthers } from '~/store/ethers'
import { useSiteStore } from '~/store/site'

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
      return this.domainName.replace(this.$config.tldName, '')
    },

    fileUploadEnabled() {
      return this.siteStore.getFileUploadEnabled
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    processUploadedFileUrl(fileUrl) {
      this.imageLink = fileUrl
      this.currentTab = 'paste'
    },

    async submitToBlockchain() {
      this.waitingSubmit = true

      const punkInterface = new ethers.utils.Interface([
        'function getDomainData(string calldata _domainName) public view returns(string memory)',
        'function editData(string calldata _domainName, string calldata _data) external',
      ])

      const punkContract = new ethers.Contract(this.$config.punkTldAddress, punkInterface, this.signer)

      // get domain data
      let domainData = await punkContract.getDomainData(String(this.domainNameWithoutTld).toLowerCase())

      //console.log('Domain name:', this.domainNameWithoutTld)
      //console.log('Domain data:', domainData)

      try {
        domainData = JSON.parse(domainData)
      } catch (e) {
        domainData = {}
      }

      domainData['image'] = this.imageLink

      try {
        const tx = await punkContract.editData(
          String(this.domainNameWithoutTld).toLowerCase(), 
          JSON.stringify(domainData),
        )

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          },
        )

        const receipt = await tx.wait()

        if (receipt.status === 1) {
          this.waitingSubmit = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully changed your profile image!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.$emit('processFileUrl', this.imageLink)
          document.getElementById('closeChangeImageModal' + this.componentId).click()
        } else {
          this.waitingSubmit = false
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('reason=')[1]
          extractMessage = extractMessage.split(', method=')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingSubmit = false
      }

      this.waitingSubmit = false
    },
  },

  setup() {
    const { signer, chainId, isActivated } = useEthers()
    const siteStore = useSiteStore()
    const toast = useToast()

    return {
      signer,
      chainId,
      isActivated,
      siteStore,
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