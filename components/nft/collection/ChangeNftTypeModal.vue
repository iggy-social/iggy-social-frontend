<template>
  <div class="modal fade" id="changeNftTypeModal" tabindex="-1" aria-labelledby="changeNftTypeModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="changeNftTypeModalLabel">Change NFT Type</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>Current type of this NFT collection is: {{ editImageOptions[cType].description }}.</p>

          <p><strong>Pick one of these options:</strong></p>

          <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ editImageOptions[typeChoice].description }}
            </button>
            <div class="dropdown-menu text-break">

              <span v-for="(option, index) in editImageOptions" :key="index" @click="typeChoice = index" class="dropdown-item cursor-pointer">
                {{ option.description }}
              </span>

            </div>
          </div>

          <div class="mt-3">
            <p v-if="typeChoice==0">
              The "Onchain image(s)" option means that metadata is stored onchain (within the smart contract itself). 
              Use this option if you want to add an image URL in the field below (not a metadata file). This is the 
              default option for NFTs created through this launchpad.
            </p>

            <p v-if="typeChoice==1">
              The "Static metadata URL" option means that all the NFTs in the collection have the same (static) image and meta data. The 
              metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you have a URL of 
              a single metadata <strong>file</strong> (all NFTs have the same metadata and image).
            </p>

            <p v-if="typeChoice==2">
              The "Generative metadata (.json)" option means that all the NFTs in the collection have a different image and 
              different meta data. The metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you 
              have a metadata <strong>folder</strong> URL with multiple metadata files in it, where these files HAVE a .json extension.
            </p>

            <p v-if="typeChoice==3">
              The "Generative metadata" option means that all the NFTs in the collection have a different image and 
              different meta data. The metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you 
              have a metadata <strong>folder</strong> URL with multiple metadata files in it, where these files DO NOT HAVE a .json extension.
            </p>
          </div>

          <div class="mt-4">
            <label for="imageMetadataUrl" class="form-label">
              <strong>
                Enter 
                <span v-if="typeChoice==0">image URL:</span>
                <span v-if="typeChoice==1">metadata file URL:</span>
                <span v-if="typeChoice==2">metadata folder URL:</span>
                <span v-if="typeChoice==3">metadata folder URL:</span>
              </strong>
            </label>

            <input v-model="editImageMetadataUrl" type="text" class="form-control" id="imageMetadataUrl">
          </div>

          <div class="mt-4" v-if="typeChoice > 0">
            <label for="collectionPreviewUrl" class="form-label">
              <strong>
                Change collection preview image (optional):
              </strong>
            </label>

            <input v-model="editImagePreviewUrl" type="text" class="form-control" id="collectionPreviewUrl" aria-describedby="previewImageHelp">
            <div id="previewImageHelp" class="form-text">This is a preview image for the whole collection, not for individual NFTs.</div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button @click="updateMetadata" type="button" class="btn btn-primary" :disabled="!editImageMetadataUrl || waitingMetadata">
            <span v-if="waitingMetadata" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
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
  name: 'ChangeNftTypeModal',
  props: ["cAddress", "cType", "mdAddress"],
  emits: ["saveCollection"],

  data() {
    return {
      componentId: null,
      editImageMetadataUrl: null,
      editImageOptions: [
        { description: "0) Onchain image(s)" },
        { description: "1) Static metadata URL" },
        { description: "2) Generative metadata (.json)" },
        { description: "3) Generative metadata" }
      ],
      editImagePreviewUrl: "", // important: should be empty string, not null
      typeChoice: 0, // 0 = static image URL, 1 = static metadata URL, 2 = generative metadata URL, 3 = generative metadata URL without .json extension
      waitingMetadata: false
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async updateMetadata() {
      this.waitingMetadata = true;

      const metadataInterface = new ethers.utils.Interface([
        "function setMdTypeAndUrlOrImage(address nftAddress_, uint256 mdType_, string memory mdUrlOrImage_, string memory collectionImage_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      if (this.typeChoice === 0) {
        this.editImagePreviewUrl = this.editImageMetadataUrl;
      }

      if (this.editImagePreviewUrl === null) {
        this.editImagePreviewUrl = "";
      }

      try {
        const tx = await metadataContract.setMdTypeAndUrlOrImage(
          this.cAddress,
          this.typeChoice,
          this.editImageMetadataUrl,
          this.editImagePreviewUrl
        ); 

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

          this.toast("You have updated the NFT image and/or metadata URL.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.$emit("saveCollection", {
            type: this.typeChoice,
            image: this.editImagePreviewUrl
          });

          this.editImageMetadataUrl = null;
          this.editImagePreviewUrl = ""; // important: should be empty string, not null

          // close the modal
          document.getElementById('closeModal-'+this.componentId).click();

          this.waitingMetadata = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingMetadata = false;
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

        this.waitingMetadata = false;
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