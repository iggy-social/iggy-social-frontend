<template>
  <!-- Modal -->
  <div
    class="modal fade"
    :id="'fileUploadModal' + componentId"
    :aria-labelledby="'fileUploadModalLabel' + componentId"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'fileUploadModalLabel' + componentId">{{ getTitle }}</h1>
          <button
            :id="'closeFileUploadModal' + componentId"
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
              <p v-if="infoText">{{ infoText }}</p>

              <div v-if="arweaveBalanceTooLow">
                <p class="text-danger">
                  Error: Arweave is used as file storage. Current balance in the Arweave wallet is insufficient to do the upload. 
                </p>
                <p>
                  <span class="text-danger">Please send AR tokens to this wallet (min. {{ $config.public.arweaveMinBalance }} AR) to enable uploads: </span> 
                  <a :href="'https://arscan.io/address/' + this.$config.public.arweaveAddress" target="_blank">{{ this.$config.public.arweaveAddress }}</a>.
                </p>
              </div>

              <FileUploadInput
                btnCls="btn btn-primary"
                :disable="arweaveBalanceTooLow"
                :maxFileSize="maxFileSize"
                :storageType="storageType"
                @processUploadedFileUrl="processUploadedFileUrl"
              />

              <!--
              <div v-if="!arweaveBalanceTooLow">
                <hr />
                <p><small>The file will be uploaded to Arweave. Current balance in the wallet: {{ arBalance }} AR.</small></p>
              </div>
              -->
            </div>

            <!-- Paste Link Tab -->
            <div v-if="currentTab === 'paste'">
              <p>Paste file link</p>

              <input v-model="pastedLink" type="text" class="form-control mb-3" placeholder="Enter http link to file" />

              <button class="btn btn-primary" @click="processUploadedFileUrl(pastedLink)" :disabled="!pastedLink">
                Submit link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSiteSettings } from '@/composables/useSiteSettings'
import FileUploadInput from '@/components/storage/FileUploadInput.vue'

export default {
  name: 'FileUploadModal',
  props: ['title', 'componentId', 'infoText', 'maxFileSize', 'storageType'],
  emits: ['processFileUrl'],
  components: { FileUploadInput },

  data() {
    return {
      currentTab: 'upload',
      pastedLink: null,
    }
  },

  mounted() {
    if (!this.fileUploadEnabled) {
      this.currentTab = 'paste'
    }
  },

  computed: {
    arBalance() {
      if (this.arweaveBalance) {
        const balancePrecision = Number(this.arweaveBalance).toFixed(6);
        return Number.parseFloat(balancePrecision);
      }
      
      return 0
    },

    arweaveBalanceTooLow() {
      if (this.storageType !== 'arweave') {
        return false
      }
      
      return this.arBalance < this.$config.public.arweaveMinBalance
    },

    fileUploadEnabled() {
      return this.$config.public.fileUploadEnabled
    },

    getTitle() {
      return this.title || 'Upload file'
    },
  },

  methods: {
    processUploadedFileUrl(fileUrl) {
      this.$emit('processFileUrl', fileUrl)
      document.getElementById('closeFileUploadModal' + this.componentId).click()
    },

    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeFileUploadModal' + this.componentId)
      if (closeButton) {
        closeButton.blur()
      }
    },
  },

  setup() {
    const { arweaveBalance } = useSiteSettings()

    return {
      arweaveBalance,
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
  },
}
</script>
