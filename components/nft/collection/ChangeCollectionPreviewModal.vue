<template>
  <div class="modal fade" id="changeCollectionPreviewModal" tabindex="-1" aria-labelledby="changeCollectionPreviewModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="changeCollectionPreviewModalLabel">Change Collection Preview Image</h1>
          <button id="closeChangeCollectionPreviewModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>Change your collection preview image.</p>

          <div class="mt-4">
            <label for="collectionImageInput" class="form-label">
              <strong>
                Enter new preview image URL:
              </strong>
            </label>

            <input v-model="editImageUrl" type="text" class="form-control" id="collectionImageInput">
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button @click="updateImage" type="button" class="btn btn-primary" :disabled="!editImageUrl || waiting">
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
  name: 'ChangeCollectionPreviewModal',
  props: ["cAddress", "cType", "mdAddress"],
  emits: ["saveCollection"],

  data() {
    return {
      editImageUrl: null,
      waiting: false
    }
  },

  methods: {
    async updateImage() {
      this.waiting = true;

      const metadataInterface = new ethers.utils.Interface([
        "function setCollectionPreview(address nftAddress_, string memory collectionPreview_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      try {
        const tx = await metadataContract.setCollectionPreview(this.cAddress, this.editImageUrl); 

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

          this.$emit("saveCollection", this.cType, this.editImageUrl);

          this.editImageUrl = null;

          // close the modal
          document.getElementById('closeChangeCollectionPreviewModal').click();

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