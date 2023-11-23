<template>
  <!-- Modal -->
  <div class="modal fade" :id="'fileUploadModal'+componentId" tabindex="-1" :aria-labelledby="'fileUploadModalLabel'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'fileUploadModalLabel'+componentId">{{ getTitle }}</h1>
          <button :id="'closeFileUploadModal'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
              >Upload</button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                :class="currentTab === 'paste' ? 'active' : ''" 
                @click="currentTab = 'paste'" 
              >Paste Link</button>
            </li>
          </ul>
          <!-- END Tabs Navigation -->

          <!-- Tabs Content -->
          <div class="tab-content mt-3">

            <!-- Upload Tab -->
            <div v-if="currentTab === 'upload'">
              <p v-if="infoText">{{ infoText }}</p>
  
              <FileUploadInput 
                btnCls="btn btn-primary"
                :maxFileSize="maxFileSize" 
                @processUploadedFileUrl="processUploadedFileUrl"
              />
            </div>

            <!-- Paste Link Tab -->
            <div v-if="currentTab === 'paste'">
              <p>Paste file link</p>

              <input v-model="pastedLink" type="text" class="form-control mb-3" placeholder="Enter http link to file" />

              <button 
                class="btn btn-primary" 
                @click="processUploadedFileUrl(pastedLink)"
                :disabled="!pastedLink"
              >
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
import { useSiteStore } from '~/store/site';
import FileUploadInput from '~/components/storage/FileUploadInput.vue';

export default {
  name: "FileUploadModal",
  props: ["title", "componentId", "infoText", "maxFileSize"],
  emits: ["processFileUrl"],
  components: { FileUploadInput },

  data()  {
    return {
      currentTab: "upload",
      pastedLink: null
    }
  },

  mounted() {
    if (!this.fileUploadEnabled) {
      this.currentTab = "paste";
    }
  },

  computed: {
    fileUploadEnabled() {
      return this.siteStore.getFileUploadEnabled;
    },

    getTitle() {
      return this.title || "Upload file";
    },
  },

  methods: {
    processUploadedFileUrl(fileUrl) {
      this.$emit("processFileUrl", fileUrl);
      document.getElementById('closeFileUploadModal'+this.componentId).click();
    }
  },

  setup() {
    const siteStore = useSiteStore();

    return {
      siteStore
    }
  },

  watch: {
    fileUploadEnabled() {
      if (!this.fileUploadEnabled) {
        this.currentTab = "paste";
      } else {
        this.currentTab = "upload";
      }
    }
  }
}
</script>