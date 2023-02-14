<template>
  <img :src="imgPath" />
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/resolvers.json";

export default {
  name: "ProfileImage",
  props: ["image", "address", "domain", "refresh"],

  data() {
    return {
      imgPath: "https://img.icons8.com/color/40/000000/guest-female.png"
    }
  },

  mounted() {
    if (this.image) {
      this.imgPath = this.image;
      localStorage.setItem(String(this.address).toLowerCase()+"-img", this.image); // if image, then store it in local storage
    } else {
      if (this.refresh) {
        this.fetchFreshImage();
      } else {
        const storedImage = localStorage.getItem(String(this.address).toLowerCase()+"-img");

        if (storedImage) {
          this.imgPath = storedImage;
        } else {
          this.fetchFreshImage();
        }
      }
    }
  },

  methods: {
    async fetchFreshImage() {
      // check PD resolver is image is stored there
      if (this.domain) {
        let provider = this.$getFallbackProvider(this.$config.supportedChainId);

        if (this.isActivated && this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's MetaMask
          provider = this.signer;
        }

        const contract = new ethers.Contract(resolvers[this.$config.supportedChainId], ResolverAbi, provider);

        // @todo: store to local storage
      }
      

      // if still not found, check orbis
      // if still nothing, keep the default image
      console.log("fetch fresh image");
      
    }
  },
 
  setup() {
    const { chainId, isActivated, signer } = useEthers();

    return { chainId, isActivated, signer }
  },
}
</script>