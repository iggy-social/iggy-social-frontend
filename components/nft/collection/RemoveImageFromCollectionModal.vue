<template>
  <div class="modal fade" id="removeImageFromCollectionModal" tabindex="-1" :aria-labelledby="'modalLabel-'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-'+componentId">Remove Image From Collection</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">

          <div class="row">
            <label :for="'input-'+componentId" class="form-label">
              <strong>
                Load images from collection:
              </strong>
            </label>
          </div>

          <div>
            <button class="btn btn-primary" @click="loadImages" :disabled="waitingLoad">
              <span v-if="waitingLoad" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Load images
            </button>
          </div>

          <div class="row mt-3" v-if="images">
            <div v-for="(image, index) in images" :key="image" class="col-md-4 mb-3">
              <div class="card">
                <img :src="image" class="card-img-top">
                <div class="card-body">
                  <div class="row">
                    <button class="btn btn-danger" @click="removeImage(index)" :disabled="waitingRemove || images.length == 1">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
  name: 'RemoveImageFromCollectionModal',
  props: ["cAddress", "mdAddress"],

  data() {
    return {
      componentId: null,
      images: [],
      imageUrl: null,
      waitingLoad: false,
      waitingRemove: false
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async loadImages() {
      this.waitingLoad = true;

      const metadataInterface = new ethers.utils.Interface([
        "function getCollectionImages(address nftAddress_) external view returns (string[] memory)"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      try {
        this.images = await metadataContract.getCollectionImages(this.cAddress); 
        this.waitingLoad = false;
      } catch (e) {
        console.error(e);
        this.waitingLoad = false;
      }
    },

    async removeImage(imageIndex) {
      this.waitingRemove = true;

      const metadataInterface = new ethers.utils.Interface([
        "function removeImageFromCollectionByIndex(address nftAddress_, uint256 index_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      try {
        const tx = await metadataContract.removeImageFromCollectionByIndex(this.cAddress, imageIndex); 

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

          this.toast("You have successfully removed an image from the NFT collection.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.imageUrl = null;

          // remove image from array by index
          const newImgArray = [...this.images];
          newImgArray.splice(imageIndex, 1);
          this.images = newImgArray;

          this.waitingRemove = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingRemove = false;
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

        this.waitingRemove = false;
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