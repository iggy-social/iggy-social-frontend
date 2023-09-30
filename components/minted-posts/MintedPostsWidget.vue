<template>
<div v-if="randomNumbers.length > 0" class="card m-2 bg-light">
  <div class="card-header bg-light">
    <span v-if="randomNumbers.length < numberOfPosts" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
    {{ getWidgetTitle }}
  </div>

  <div class="card-body sidebar-card-body">
    <div class="row">
      <div :class="getImageColumnWidth" v-for="id in randomNumbers" :key="id">
        <MintedPostImage :id="id" @click="$emit('closeRightSidebar')" />
      </div>
    </div>
  </div>

  <div class="card-footer bg-light text-body-secondary text-center">
    <a :href="$config.marketplacePostNftUrl" class="btn btn-outline-primary mb-3" target="_blank">
      See all minted posts
      <i class="bi bi-box-arrow-up-right ms-1"></i>
    </a>
  </div>
</div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import MintedPostImage from './MintedPostImage.vue';

export default {
  name: "MintedPostsWidget",
  emits: ["closeRightSidebar"],

  data() {
    return {
      numberOfPosts: this.$config.randomPostsNumber,
      randomNumbers: []
    };
  },

  components: {
    MintedPostImage
  },

  mounted() {
    this.fetchRandomMintedPosts();
  },

  computed: {
    getImageColumnWidth() {
      if (this.$config.randomPostsNumber === 1) {
        return "col-12"
      } else {
        return "col-12 mt-4"
      }
    },

    getWidgetTitle() {
      if (this.$config.randomPostsNumber === 1) {
        return "Random Minted Post"
      } else {
        return "Random Minted Posts"
      }
    },
  },

  methods: {
    async fetchRandomMintedPosts() {
      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated) {
        if (this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's MetaMask
          provider = this.signer;
        }
      }

      const iggyPostInterface = new ethers.utils.Interface([
        "function counter() external view returns (uint256)"
      ]);

      const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, provider);

      const counter = await iggyContract.counter();

      if (Number(counter) > 1) {
        // generate unique random numbers between 1 and (counter-1)
        this.randomNumbers = [];

        while (this.randomNumbers.length < this.numberOfPosts) {
          const randomNumber = Math.floor(Math.random() * (counter - 1)) + 1;
          if (!this.randomNumbers.includes(randomNumber)) {
            this.randomNumbers.push(randomNumber);
          }
        }
      }
      
    }
  },

  setup() {
    const { isActivated, chainId, signer } = useEthers();

    return {
      isActivated,
      chainId,
      signer
    }
  }
}
</script>