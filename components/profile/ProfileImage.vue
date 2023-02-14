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
  props: ["address", "domain", "image", "refresh"],

  data() {
    return {
      imgPath: null,
      defaultImage: "https://img.icons8.com/color/40/000000/guest-female.png"
    }
  },

  created() {
    this.imgPath = this.defaultImage;
  },

  mounted() {
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

        // fetch domain data from Punk Domains
        const domainData = await contract.getDomainData (
          String(this.domain).toLowerCase().split(".")[0], 
          String(this.$config.tldName).toLowerCase()
        );

        if (domainData) {
          const imgAddress = JSON.parse(domainData).imgAddress;

          if (imgAddress) {
            if (imgAddress.startsWith("ipfs://") || imgAddress.startsWith("http")) {
              this.imgPath = imgAddress;
              window.localStorage.setItem(String(this.address).toLowerCase()+"-img", this.imgPath); // if image, then store it in local storage
            }
          }

          // @todo: fetch and parse image set as NFT
        }
      }

      // @todo if still not found, check orbis
      if (this.imgPath === this.defaultImage && this.image) {
        this.imgPath = this.image;
        window.localStorage.setItem(String(this.address).toLowerCase()+"-img", this.imgPath); // if image, then store it in local storage
      }
    }
  },
 
  setup() {
    const { chainId, isActivated, signer } = useEthers();

    return { chainId, isActivated, signer }
  },
}
</script>