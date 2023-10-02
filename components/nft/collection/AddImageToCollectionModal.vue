<template>
  <div class="modal fade" id="addImageToCollectionModal" tabindex="-1" :aria-labelledby="'modalLabel-'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-'+componentId">Add Image To Collection</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">

          <div class="mt-4">
            <label :for="'input-'+componentId" class="form-label">
              <strong>
                Add this image URL to collection:
              </strong>
            </label>

            <input v-model="imageUrl" type="text" class="form-control" :id="'input-'+componentId">

            <div v-if="imageUrl" class="mt-3">
              <img :src="imageUrl" class="img-thumbnail img-fluid" style="max-width: 100px;" />
              <br />
              <small>If image didn't appear above, then something is wrong with the link you added.</small>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button @click="addNewImage" type="button" class="btn btn-primary" :disabled="!imageUrl || waiting">
            <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Submit
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

export default {
  name: 'AddImageToCollectionModal',
  props: ["cAddress", "mdAddress"],

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
    async addNewImage() {
      this.waiting = true;

      const metadataInterface = new ethers.utils.Interface([
        "function addImageToCollection(address nftAddress_, string memory imageUrl_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      try {
        const tx = await metadataContract.addImageToCollection(this.cAddress, this.imageUrl); 

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

          this.toast("You have successfully added new image URL to the NFT collection.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
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
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      }
    },
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();

    return { signer, toast };
  }
}
</script>