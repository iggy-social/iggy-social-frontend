<template>
  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3">{{ domain }}</h3>

      <ProfileImage v-if="uAddress" class="img-fluid img-thumbnail rounded-circle w-25" :address="uAddress" :domain="domain" :image="orbisImage" />

      <p class="text-break mt-3">Address: {{ uAddress }}</p>
      <p class="text-break mt-3">Followers: {{ followers }}</p>
      <p class="text-break mt-3">Following: {{ following }}</p>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers';
import { useUserStore } from '~/store/user'
import ProfileImage from "~/components/profile/ProfileImage.vue";
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/data/resolvers.json";

export default {
  name: "PunkProfile",
  props: ["pAddress", "pDomain"],

  data() {
    return {
      domain: this.pDomain,
      followers: 0,
      following: 0,
      isUserConnectedOrbis: null,
      lastActivityTimestamp: null,
      orbisImage: null,
      uAddress: this.pAddress
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

    if (!this.userStore.getDid) {
      this.checkConnectionToOrbis();
    }

    
  },

  methods: {
    async checkConnectionToOrbis() {
      this.isUserConnectedOrbis = await this.$orbis.isConnected();

      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },

    async fetchAddressAndDomain() {
      // see if id is in the URL query and figure out whether it is a domain or uAddress
      if (this.$route.query.id) {
        const id = this.$route.query.id;

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

      this.fetchOrbisProfile();
    },

    async fetchOrbisProfile() {
      if (this.uAddress) {
        let { data, error } = await this.$orbis.getDids(this.uAddress);

        if (data[0].did) {
          const profile = await this.$orbis.getProfile(data[0].did);

          if (profile && profile.data.details.profile) {
            this.orbisImage = profile.data.details.profile.pfp;
          }

          if (profile) {
            this.followers = profile.data.count_followers;
            this.following = profile.data.count_following;
            this.lastActivityTimestamp = profile.data.last_activity_timestamp;
          }
        }
      }
    }

    // @todo: refresh button to refresh user data (e.g. profile image)
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const userStore = useUserStore();

    return { address, chainId, isActivated, userStore, signer };
  },

  watch: {
    address() {
      this.fetchAddressAndDomain();
    }
  }
}
</script>
