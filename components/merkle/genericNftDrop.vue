<template>
  <div>
    <hr />

    <h4 class="text-center mt-5">{{ title }}</h4>

    <div class="d-flex justify-content-center mt-4 mb-4">
      <img :src="nftImage" class="img-thumbnail" :class="imageClass" style="max-width: 200px;" alt="NFT image">
    </div>

    <p v-if="!isUserEligible" class="text-center">
      Not eligible...
    </p>

    <div v-if="isUserEligible">
      <p class="text-center">
        {{ description }}
      </p>

      <div class="d-flex justify-content-center mt-4 mb-4">
        <button 
          :disabled="waiting" 
          @click="claim"
          class="btn btn-outline-primary"
        >
          <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Claim NFT
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export default {
  name: 'GenericNftDrop', // reusable component for all NFT drops
  props: ["claimersData", "description", "imageClass", "merkleClaimerAddress", "nftImage", "title"],

  data() {
    return {
      isUserEligible: false,
      userArrayPosition: -1,
      waiting: false
    }
  },

  mounted() {
    if (!this.isUserEligible) {
      this.checkEligibility();
    }
  },

  methods: {
    checkEligibility() {
      const eligibility = this.claimersData.claimers.findIndex(item => item[0].toLowerCase() === this.address.toLowerCase());

      if (eligibility > -1) {
        this.isUserEligible = true;
        this.userArrayPosition = eligibility;
      } else {
        this.isUserEligible = false;
        this.userArrayPosition = -1;
      }
    },

    async claim() {
      this.waiting = true;

      // set up merkle tree
      const tree = StandardMerkleTree.of(this.claimersData.claimers, ["address", "uint256"]);

      // get proof
      const proof = tree.getProof(this.userArrayPosition);

      // set up staking contract
      const merkleClaimerInterface = new ethers.utils.Interface([
        "function claim(address to_, bytes32[] memory proof_) external"
      ]);

      const merkleClaimerContract = new ethers.Contract(
        this.merkleClaimerAddress,
        merkleClaimerInterface,
        this.signer
      );

      try {
        const tx = await merkleClaimerContract.claim(this.address, proof);

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

          this.toast("You have successfully claimed the NFT!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

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
          extractMessage = extractMessage.replace('MerkleClaimerERC721: ', "");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      }
    }
    
  },

  setup() {
    const { address, chainId, signer } = useEthers();
    const toast = useToast();

    return { address, chainId, signer, toast }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.checkEligibility();
      }
    },
  }

}
</script>