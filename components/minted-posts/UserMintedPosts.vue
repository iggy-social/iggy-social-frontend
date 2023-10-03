<template>
  <!-- loading spinner -->
  <div v-if="loadingMintedPosts" class="d-flex justify-content-center mb-3">
    <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
  </div>

  <div v-if="mintedPostIds" class="row">
    <div class="col-6 col-sm-4 col-md-3 mb-2" v-for="id in mintedPostIds" :key="id">
      <MintedPostImage :id="id" />
    </div>
  </div>

  <div v-if="postsDifference > 0" class="d-flex justify-content-center mt-3">
    <p>+ {{ postsDifference }} other minted posts</p>
  </div>

  <div v-if="!loadingMintedPosts && mintedPostIds.length === 0">
    <p>No minted posts yet.</p>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import MintedPostImage from './MintedPostImage.vue';

export default {
  name: 'UserMintedPosts',
  props: ["address"],

  data() {
    return {
      loadingMintedPosts: false,
      mintedPostIds: [],
      postsDifference: 0
    };
  },

  components: {
    MintedPostImage
  },

  mounted() {
    this.fetchMintedPostIds();
  },

  methods: {
    async fetchMintedPostIds() {
      this.loadingMintedPosts = true;

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated) {
        if (this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's MetaMask
          provider = this.signer;
        }
      }

      const iggyStatsInterface = new ethers.utils.Interface([
        "function getMintedPostIdsArray(address) external view returns (uint256[] memory)"
      ]);

      const iggyStatsContract = new ethers.Contract(this.$config.iggyPostStatsAddress, iggyStatsInterface, provider);

      let mintedIds = await iggyStatsContract.getMintedPostIdsArray(this.address);
      mintedIds = [...mintedIds].reverse();

      // get last n minted post IDs
      this.mintedPostIds = mintedIds.slice(0, this.$config.profileMintedPostIdsMax);

      // if the number is reduced, show a text at the end showing a number of posts that are not shown
      this.postsDifference = mintedIds.length - this.mintedPostIds.length;

      this.loadingMintedPosts = false;
    }
  },

  setup() {
    const { isActivated, chainId, signer } = useEthers();

    return {
      isActivated,
      chainId,
      signer
    };
  }
}
</script>