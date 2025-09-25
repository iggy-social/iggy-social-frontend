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
                Recipient address or {{ $config.public.tldName }} name:
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
import { isAddress, parseAbi } from 'viem';
import { useToast } from "vue-toastification/dist/index.mjs";
import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'
import WaitingToast from "@/components/WaitingToast";
import { hasTextBlankCharacters } from '@/utils/textUtils';

export default {
  name: 'SendNftModal',
  props: ["address", "cAddress"],

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
        const nftAbi = parseAbi([
          "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
        ]);

        try {
          const result = await readData({
            address: this.cAddress,
            abi: nftAbi,
            functionName: 'tokenOfOwnerByIndex',
            args: [this.address, 0n] // get user's NFT if it exists
          });
          
          if (result) {
            this.tokenId = result.toString();
          }
        } catch (e) {
          console.log("Could not fetch NFT ID for user.");
        }
      }

      this.waitingFetchNft = false;
    },

    async loadNftData() {
      // get NFT metadata from tokenURI
      this.waiting = true;

      const nftAbi = parseAbi([
        "function ownerOf(uint256 tokenId) external view returns (address)",
        "function tokenURI(uint256 tokenId) external view returns (string)"
      ]);

      try {
        // Check ownership first
        const holder = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'ownerOf',
          args: [BigInt(this.tokenId)]
        });

        console.log("NFT holder: ", holder);

        if (String(holder).toLowerCase() !== String(this.address).toLowerCase()) {
          this.toast(`You are not the owner of NFT with ID ${this.tokenId}. Try some other ID number.`, {type: "error"});
          this.waiting = false;
          return;
        }

        // Get token URI
        let tokenURI = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'tokenURI',
          args: [BigInt(this.tokenId)]
        });

        if (tokenURI.startsWith("ipfs://")) {
          tokenURI = tokenURI.replace("ipfs://", this.$config.public.ipfsGateway);
        } else if (tokenURI.startsWith("ar://")) {
          tokenURI = tokenURI.replace("ar://", this.$config.public.arweaveGateway);
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
          json["image"] = json["image"].replace("ipfs://", this.$config.public.ipfsGateway);
        } else if (json["image"].startsWith("ar://")) {
          json["image"] = json["image"].replace("ar://", this.$config.public.arweaveGateway);
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
        if (isAddress(recipient)) {
          this.recipientAddress = recipient;
        } else {
          const domainName = String(recipient).trim().toLowerCase().replace(this.$config.public.tldName, "");

          const tldAbi = parseAbi([
            "function getDomainHolder(string) view returns (address)"
          ]);

          try {
            this.recipientAddress = await readData({
              address: this.$config.public.punkTldAddress,
              abi: tldAbi,
              functionName: 'getDomainHolder',
              args: [domainName]
            });
          } catch (error) {
            console.error("Error fetching domain holder:", error);
            this.toast("Could not resolve domain name to address.", {type: "error"});
          }
        }
      }
    },

    async transferNft() {
      this.waiting = true;

      await this.processRecipient(this.recipientInput);

      if (!this.recipientAddress) {
        this.toast("Could not resolve recipient address.", {type: "error"});
        this.waiting = false;
        return;
      }

      const nftAbi = parseAbi([
        "function transferFrom(address from, address to, uint256 tokenId) external"
      ]);

      let toastWait;
      
      try {
        const hash = await writeData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'transferFrom',
          args: [this.address, this.recipientAddress, BigInt(this.tokenId)]
        });

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          }
        );

        const receipt = await waitForTxReceipt(hash);

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully transferred the NFT.", {
            type: "success",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
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
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      } finally {
        this.toast.dismiss(toastWait)
        this.waiting = false
      }
    },
  },

  setup() {
    const toast = useToast();

    return { 
      toast 
    };
  },

  watch: {
    tokenId() {
      this.nftDataLoaded = false;
    }
  }
}
</script>
