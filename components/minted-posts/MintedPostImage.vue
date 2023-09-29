<template>
  <NuxtLink :to="'/minted-post/?id=' + id">
    <img class="img-fluid rounded" :src="image" />
  </NuxtLink>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';

export default {
  name: 'MintedPostImage',
  props: ["id"],

  data() {
    return {
      streamId: null,
      image: null
    };
  },

  mounted() {
    this.fetchMetadata();
  },

  methods: {
    async fetchMetadata() {
      let post = localStorage.getItem("minted-post-" + this.id);

      if (!post) {
        // fetch provider from hardcoded RPCs
        let provider = this.$getFallbackProvider(this.$config.supportedChainId);

        if (this.isActivated) {
          if (this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's MetaMask
            provider = this.signer;
          }
        }

        const iggyPostInterface = new ethers.utils.Interface([
          "function uri(uint256 _tokenId) external view returns (string memory)"
        ]);

        const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, provider);

        post = await iggyContract.uri(this.id);
        localStorage.setItem("minted-post-" + this.id, post);
      }

      const json = atob(post.substring(29));
      const result = JSON.parse(json);

      this.streamId = result["external_url"].split("?id=")[1];
      this.image = result["image"];
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