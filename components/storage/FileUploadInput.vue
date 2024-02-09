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
    :disabled="waitingUpload || !file || fileTooBig"
  >
    <span v-if="waitingUpload" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Upload
  </button>

  <div v-if="fileTooBig" class="alert alert-danger mt-3" role="alert">
    File is too big (max size is {{ maxFileSize / 1024 / 1024 }} MB).
  </div>
</template>

<script>
import { upload } from "@spheron/browser-upload";
import ImageKit from "imagekit-javascript";

export default {
  name: "FileUploadInput",
  props: ["btnCls", "maxFileSize"],
  emits: ["processUploadedFileUrl"],

  data()  {
    return {
      componentId: null,
      file: null,
      newFileName: null,
      uploadedFileSize: null,
      uploadToken: null,
      waitingUpload: false
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  computed: {
    fileTooBig() {
      if (this.uploadedFileSize) {
        return this.maxFileSize && (this.uploadedFileSize > this.maxFileSize)
      }
    }
  },

  methods: {
    async fallbackUpload() {
      const thisAppUrl = window.location.origin;
      
      let fetcherService;
      if (this.$config.fileUploadTokenService === "netlify") {
        fetcherService = thisAppUrl + "/.netlify/functions/imageUploaderFallback";
      } else if (this.$config.fileUploadTokenService === "vercel") {
        fetcherService = thisAppUrl + "/api/imageUploaderFallback";
      }

      const resp = await $fetch(fetcherService).catch((error) => error.data);

      let authParams = resp;

      if (typeof(resp) === "string") {
        authParams = JSON.parse(resp);
      }

      const imagekit = new ImageKit({
        publicKey: this.$config.imagekitPublicKey,
        urlEndpoint: this.$config.imagekitEndpoint,
      });

      const result = await imagekit.upload({
        file: this.file,
        fileName: this.newFileName,
        tags: [this.$config.projectName, this.$config.projectUrl],
        token: authParams.data.token,
        signature: authParams.data.signature,
        expire: authParams.data.expire,
      });

      this.$emit("processUploadedFileUrl", result.url);
      
      this.waitingUpload = false;
    },

    async fetchUploadToken() {
      const thisAppUrl = window.location.origin;

      let fetcherService;

      if (this.$config.fileUploadTokenService === "netlify") {
        fetcherService = thisAppUrl + "/.netlify/functions/imageUploader";
      } else if (this.$config.fileUploadTokenService === "vercel") {
        fetcherService = thisAppUrl + "/api/imageUploader";
      }

      if (fetcherService) {
        try {
          const resp = await $fetch(fetcherService).catch((error) => error.data);

          let response = resp;

          if (typeof(resp) === "string") {
            response = JSON.parse(resp);
          }

          if (response?.error) {
            console.log("Error fetching upload token: ", response["error"]);
            throw response["error"];
          }

          if (response?.data) {
            this.uploadToken = response["data"];
          }
          
        } catch (e) {
          console.log("Error fetching a file upload token: ", e);
          throw e;
        }
      }
    },

    handleFileInput(event) {
      const uploadedFile = event.target.files[0];
      this.uploadedFileSize = uploadedFile.size;

      // check file size
      if (this.maxFileSize && uploadedFile.size > this.maxFileSize) {
        const maxSizeMb = this.maxFileSize / 1024 / 1024;
        console.error('File is too large (max size is ' + maxSizeMb + ' MB)');
        return;
      }

      // get file name
      const fileName = uploadedFile.name;

      // change file name
      const fileExtension = fileName.split(".").pop();

      // select random alphanumeric string for name
      this.newFileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "." + fileExtension;

      // create new file with new name
      const newFile = new File([uploadedFile], this.newFileName, { type: uploadedFile.type });
      this.file = newFile;
    },

    async uploadFile() {
      this.waitingUpload = true;
      
      try {
        // get session token
        await this.fetchUploadToken();

        if (this.uploadToken) {
          const token = this.uploadToken;

          const { protocolLink, cid } = await upload([this.file], { token });

          //const fullFileUrl = protocolLink + "/" + this.newFileName;
          const fullFileUrl = this.$config.ipfsGateway + cid + "/" + this.newFileName;

          // emit file url
          this.$emit("processUploadedFileUrl", fullFileUrl);
        }
      } catch (e) {
        console.log("Error uploading file. Switching to fallback upload method.");
        await this.fallbackUpload();
      }

      this.waitingUpload = false;
    }
  }
}
</script>