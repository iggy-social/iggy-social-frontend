<template>
  <div class="modal fade" id="changeCollectionPreviewModal" tabindex="-1" :aria-labelledby="'modalLabel-'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-'+componentId">Change Collection Preview Image</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>Change your collection preview image.</p>

          <div class="mt-4">
            <div v-if="!imageUrl && $config.fileUploadEnabled">
              <p>Upload new image (and then click Submit below):</p>

              <FileUploadInput 
                btnCls="btn btn-primary"
                :maxFileSize="$config.fileUploadSizeLimit" 
                @processUploadedFileUrl="insertImageLink"
              />
              

              <p class="mt-3">Or paste image link here:</p>
            </div>

            <p v-if="!$config.fileUploadEnabled">Paste image link here:</p>

            <input v-model="imageUrl" type="text" class="form-control">

            <div v-if="imageUrl" class="mt-3">
              <img :src="imageUrl" class="img-thumbnail img-fluid" style="max-width: 100px;" />
              <br />
              <small>If image didn't appear above, then something is wrong with the link you added.</small>
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
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import FileUploadInput from '~/components/storage/FileUploadInput.vue';

export default {
  name: 'ChangeCollectionPreviewModal',
  props: ["cAddress", "mdAddress"],
  emits: ["saveCollection"],
  components: { FileUploadInput },

  data() {
    return {
      componentId: null,
      imageUrl: null,
      waiting: false
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async updateImage() {
      this.waiting = true;

      const metadataInterface = new ethers.utils.Interface([
        "function setCollectionPreview(address nftAddress_, string memory collectionPreview_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      try {
        const tx = await metadataContract.setCollectionPreview(this.cAddress, this.imageUrl); 

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have updated the NFT collection preview image.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.$emit("saveCollection", {
            image: this.imageUrl
          });

          this.imageUrl = null;

          // close the modal
          document.getElementById('closeModal-'+this.componentId).click();

          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waiting = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      }
    },

    insertImageLink(fileUrl) {
      this.imageUrl = fileUrl;
    },
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();

    return { signer, toast };
  }
}
</script>