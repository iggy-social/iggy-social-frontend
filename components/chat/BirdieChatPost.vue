<template>
<div class="card bg-light mb-3" v-if="post">
  <div class="card-body row">
    <div class="col-2 col-md-1">
      <img v-if="post.creator_details.profile" :src="post.creator_details.profile.pfp" class="img-fluid rounded-circle" />
      <img v-if="!post.creator_details.profile" src="https://img.icons8.com/color/40/000000/guest-female.png" class="img-fluid rounded-circle" />
    </div>

    <div class="col-10 col-md-11">
      <p class="card-subtitle mb-1 text-muted">
        <span>{{showDomainOrAddressOrAnon}}</span>
        <span v-if="post.timestamp"> · {{timeSince}}</span>
      </p>
      <p class="card-text">{{post.content.body}}</p>
    </div>
  </div>
</div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers, shortenAddress } from 'vue-dapp';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/resolvers.json";

export default {
  name: "BirdieChatPost",
  props: ["post"],

  data() {
    return {
      authorDomain: null
    }
  },

  created() {
    if (this.isActivated && this.post.creator_details.metadata) {
      this.fetchAuthorDomain();
    }
  },

  computed: {
    showDomainOrAddressOrAnon() {
      if (this.authorDomain) {
        return this.authorDomain;
      } else if (this.post.creator_details.metadata) {
        return this.shortenAddress(this.post.creator_details.metadata.address);
      } else {
        return "Anon";
      }
    },

    timeSince() {
      if (!isNaN(this.post.timestamp)) {
        const timePosted = new Date(this.post.timestamp * 1000);
        const now = new Date();
        const secondsPast = (now.getTime() - timePosted.getTime() ) / 1000;

        if (secondsPast < 60) return secondsPast + 's';
        if (secondsPast < 3600) return parseInt(secondsPast/60) + 'min';
        if (secondsPast <= 86400) return parseInt(secondsPast/3600) + 'h';
        if (secondsPast <= 2628000) return parseInt(secondsPast/86400) + 'd';
        if (secondsPast <= 31536000) return parseInt(secondsPast/2628000) + 'mo';
        if (secondsPast > 31536000) return parseInt(secondsPast/31536000) + 'y';
      }

      return null;
    }
  },

  methods: {

    async fetchAuthorDomain() {
      const mdAddress = this.post.creator_details.metadata.address;

      if (mdAddress) {
        // check session storage if author's domain is already stored
        const storedDomain = sessionStorage.getItem(String(mdAddress).toLowerCase());

        if (storedDomain) {
          this.authorDomain = storedDomain;
        } else {
          const contract = new ethers.Contract(resolvers[this.chainId], ResolverAbi, this.signer);

          // get author's default domain
          const domainName = await contract.getDefaultDomain(
            String(mdAddress).toLowerCase(), 
            String(this.$tldName).toLowerCase()
          );

          if (domainName) {
            this.authorDomain = domainName + this.$tldName;
            sessionStorage.setItem(String(mdAddress).toLowerCase(), this.authorDomain);
          } 
        }
      }
      
    }
  },

  setup() {
    const { chainId, isActivated, signer } = useEthers();

    return { chainId, isActivated, shortenAddress, signer }
  },

  watch: {
    isActivated(newVal, oldVal) {
      if (newVal) {
        this.fetchAuthorDomain();
      }
    },
  }
}
</script>