<template>
  <div class="modal fade" id="sendNftModal" tabindex="-1" :aria-labelledby="'modalLabel-'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-'+componentId">Transfer NFT</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>
            Send/transfer NFT to another address. 
          </p>

          <button v-if="!tokenId" @click="fetchUsersNft" type="button" class="btn btn-primary mt-2" :disabled="waitingFetchNft">
            <span v-if="waitingFetchNft" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Find your NFT ID
          </button>

          <div v-if="nftDataLoaded" class="mt-4 row">
            <div class="col-md-4 col-6">
              <img :src="nftImage" class="img-fluid" alt="NFT image" height="100">
            </div>
          </div>

          <div class="mt-4">
            <label :for="'inputTokenId-'+componentId" class="form-label">
              <strong>
                NFT (token) ID to send:
              </strong>
            </label>

            <input v-model="tokenId" type="text" class="form-control" :id="'inputTokenId-'+componentId">
          </div>

          <button v-if="!nftDataLoaded && tokenId" @click="loadNftData" type="button" class="btn btn-primary mt-2" :disabled="!tokenId || waiting">
            <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Load NFT image
          </button>

          <div v-if="nftDataLoaded" class="mt-4">
            <label :for="'inputAddress-'+componentId" class="form-label">
              <strong>
                Recipient address or {{ $config.tldName }} name:
              </strong>
            </label>

            <input 
              v-model="recipientInput" 
              @keyup="findBlankCharacter"
              type="text" 
              class="form-control" 
              :id="'inputAddress-'+componentId"
            />

            <div class="form-text" id="basic-addon4" v-if="hasBlankCharacter">
              <i class="bi bi-exclamation-triangle-fill"></i>
              This domain name contains a blank character: {{ encodeURIComponent(recipientInput) }}. Proceed with caution.
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button v-if="nftDataLoaded" @click="transferNft" type="button" class="btn btn-primary" :disabled="!recipientInput || !tokenId || waiting">
            <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Transfer NFT
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { hasTextBlankCharacters } from '~/utils/textUtils';

export default {
  name: 'SendNftModal',
  props: ["address", "cAddress", "signer"],

  data() {
    return {
      componentId: null,
      editDescription: null,
      hasBlankCharacter: false,
      nftDataLoaded: false,
      nftImage: null,
      recipientAddress: null,
      recipientInput: null,
      tokenId: null,
      userSecondTokenId: null,
      waiting: false,
      waitingFetchNft: false,
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    hasTextBlankCharacters, // imported from text utils

    findBlankCharacter() {
      this.hasBlankCharacter = false;
      this.hasBlankCharacter = hasTextBlankCharacters(this.recipientInput);
    },

    async fetchUsersNft() {
      console.log("Fetching user's NFT ID...");
      this.waitingFetchNft = true;

      console.log("User's address: ", this.address);
      console.log("NFT contract address: ", this.cAddress);

      if (this.cAddress && this.address) {
        const nftInterface = new ethers.utils.Interface([
          "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
        ]);

        const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer);

        try {
          this.tokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0); // get user's NFT if it exists
        } catch (e) {
          console.log("Could not fetch NFT ID for user.");
        }
      }

      this.waitingFetchNft = false;
    },

    async loadNftData() {
      // get NFT metadata from tokenURI
      this.waiting = true;

      const nftInterface = new ethers.utils.Interface([
        "function ownerOf(uint256 tokenId) external view returns (address)",
        "function tokenURI(uint256 tokenId) external view returns (string)"
      ]);

      try {
        const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer);

        const holder = await nftContract.ownerOf(this.tokenId);

        console.log("NFT holder: ", holder);

        if (String(holder).toLowerCase() !== String(this.address).toLowerCase()) {
          this.toast(`You are not the owner of NFT with ID ${this.tokenId}. Try some other ID number.`, {type: "error"});
          this.waiting = false;
          return;
        }

        let tokenURI = await nftContract.tokenURI(this.tokenId);

        if (tokenURI.startsWith("ipfs://")) {
          tokenURI = tokenURI.replace("ipfs://", this.$config.ipfsGateway);
        } else if (tokenURI.startsWith("ar://")) {
          tokenURI = tokenURI.replace("ar://", this.$config.arweaveGateway);
        }

        let json; // NFT metadata JSON

        if (tokenURI.startsWith("https://")) {
          try {
            const res = await axios.get(tokenURI);
            json = await res.data;
          } catch (error) {
            console.log("error fetching metadata for token id: ", String(this.tokenId));
          }
        } else {
          const result = atob(tokenURI.substring(29));
          json = JSON.parse(result);
        }

        if (json["image"].startsWith("ipfs://")) {
          json["image"] = json["image"].replace("ipfs://", this.$config.ipfsGateway);
        } else if (json["image"].startsWith("ar://")) {
          json["image"] = json["image"].replace("ar://", this.$config.arweaveGateway);
        }

        this.nftImage = json["image"];
        this.nftDataLoaded = true;
        this.waiting = false;
      } catch (e) {
        console.error(e);
        this.waiting = false;
      }
    },

    async processRecipient(recipient) {
      if (recipient) {
        if (ethers.utils.isAddress(recipient)) {
          this.recipientAddress = recipient;
        } else {
          const domainName = String(recipient).trim().toLowerCase().replace(this.$config.tldName, "");

          // fetch provider from hardcoded RPCs
          let provider = this.$getFallbackProvider(this.$config.supportedChainId);

          if (this.isActivated && this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's MetaMask
            provider = this.signer;
          }

          const tldInterface = new ethers.utils.Interface([
            "function getDomainHolder(string) view returns (address)"
          ]);

          const tldContract = new ethers.Contract(this.$config.punkTldAddress, tldInterface, provider);

          this.recipientAddress = await tldContract.getDomainHolder(domainName);
        }
      }
    },

    async transferNft() {
      this.waiting = true;

      await this.processRecipient(this.recipientInput);

      const nftInterface = new ethers.utils.Interface([
        "function transferFrom(address from, address to, uint256 tokenId) external"
      ]);
      
      const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer);

      try {
        const tx = await nftContract.transferFrom(this.address, this.recipientAddress, this.tokenId);

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

          this.toast("You have successfully transferred the NFT.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.recipientAddress = null;
          this.recipientInput = null;
          this.tokenId = null;
          this.nftDataLoaded = false;

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
  },

  setup() {
    const { chainId, isActivated } = useEthers();
    const toast = useToast();

    return { chainId, isActivated, toast };
  },

  watch: {
    tokenId() {
      this.nftDataLoaded = false;
    }
  }
}
</script>