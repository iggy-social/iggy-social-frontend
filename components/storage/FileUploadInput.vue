<template>
  <input 
    @change="handleFileInput"
    type="file" 
    class="form-control form-control-lg mb-3" 
    :id="'file-input-'+componentId"
  />

  <button 
    type="button" 
    :class="btnCls" 
    @click="uploadFile"
    :disabled="waitingUpload || !file"
  >
    <span v-if="waitingUpload" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Upload
  </button>
</template>

<script>
export default {
  name: "FileUploadInput",
  props: ["btnCls", "maxFileSize"],
  emits: ["processUploadedFileUrl"],

  data()  {
    return {
      componentId: null,
      file: null,
      waitingUpload: false
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    handleFileInput(event) {
      const uploadedFile = event.target.files[0];
      this.file = uploadedFile;
    },

    async uploadFile() {
      // get session token
    }
  }
}
</script>