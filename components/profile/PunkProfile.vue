<template>
  <div class="card border">
    <div class="card-body">
      <h3 class="mb-3">{{ domain }}</h3>

      <ProfileImage v-if="uAddress" class="img-fluid img-thumbnail rounded-circle w-25" :address="uAddress" :domain="domain" />

      <p class="text-break mt-3">Address: {{ uAddress }}</p>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers';
import { useExampleStore } from '~/store/example'
import ProfileImage from "~/components/profile/ProfileImage.vue";
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/data/resolvers.json";

export default {
  name: "PunkProfile",
  props: ["pAddress", "pDomain"],

  data() {
    return {
      uAddress: this.pAddress,
      domain: this.pDomain,
    }
  },

  components: {
    ProfileImage
  },

  created() {
    // if uAddress and/or domain is not provided via props, then find it yourself
    if (!this.pAddress || !this.pDomain) {
      this.fetchAddressAndDomain();
    }
  },

  methods: {
    async fetchAddressAndDomain() {
      // see if id is in the URL query and figure out whether it is a domain or uAddress
      console.log("fetchAddressAndDomain() called")

      if (this.$route.query.id) {
        console.log("this.$route.query.id")
        const id = this.$route.query.id;

        console.log(id)

        if (id.includes(".")) {
          this.domain = id; // domain
        } else {
          this.uAddress = id; // address
        }
      } else {
        // if no id is provided, then use the user's address
        this.uAddress = this.address;
      }

      // if domain is not provided, check session storage
      if (!this.domain && this.uAddress) {
        this.domain = window.sessionStorage.getItem(String(this.uAddress).toLowerCase());
      }

      // set contract
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      const contract = new ethers.Contract(resolvers[this.$config.supportedChainId], ResolverAbi, provider);

      // if domain is not provided, then fetch it
      if (!this.domain && this.uAddress) {
        const domainName = await contract.getDefaultDomain(
          String(this.uAddress).toLowerCase(), 
          String(this.$config.tldName).toLowerCase()
        );

        if (domainName) {
          this.domain = domainName + this.$config.tldName;
          window.sessionStorage.setItem(String(this.uAddress).toLowerCase(), this.domain);
        } 
      }

      if (this.domain && !this.uAddress) {
        const domainHolder = await contract.getDomainHolder(
          String(this.domain).toLowerCase().split(".")[0], 
          String(this.$config.tldName).toLowerCase()
        );

        if (domainHolder !== ethers.constants.AddressZero) {
          this.uAddress = domainHolder;
        }

        window.sessionStorage.setItem(String(this.uAddress).toLowerCase(), this.domain);
      }
    },

    // @todo: refresh button to refresh user data (e.g. profile image)
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const exampleStore = useExampleStore();

    return { address, chainId, isActivated, exampleStore, signer };
  },

  watch: {
    address() {
      this.fetchAddressAndDomain();
    }
  }
}
</script>
