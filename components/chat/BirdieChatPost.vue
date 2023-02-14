<template>
<div class="card mb-3" v-if="post">
  <div class="card-body row">
    <div class="col-2 col-md-1">
      <ProfileImage 
        class="img-fluid rounded-circle"
        :address="authorAddress" 
        :domain="authorDomain"
        :image="getOrbisImage"
      />
      <!--
      <img v-if="post.creator_details.profile" :src="post.creator_details.profile.pfp" class="img-fluid rounded-circle" />
      <img v-if="!post.creator_details.profile" src="https://img.icons8.com/color/40/000000/guest-female.png" class="img-fluid rounded-circle" />
      -->
    </div>

    <div class="col-10 col-md-11">
      <p class="card-subtitle mb-1 text-muted">
        <span v-if="authorDomain"><NuxtLink :to="'/profile/?id='+authorDomain">{{showDomainOrAddressOrAnon}}</NuxtLink></span>
        <span v-if="!authorDomain">{{showDomainOrAddressOrAnon}}</span>
        <span v-if="post.timestamp"> · <NuxtLink :to="'/post/?id='+post.stream_id">{{timeSince}}</NuxtLink></span>
      </p>

      <p class="card-text" v-html="parsedText"></p>

      <p class="card-subtitle mt-1 text-muted">
        <i @click="likePost" :class="alreadyLiked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i> 
        {{post.count_likes}}
      </p>

      <p class="card-subtitle mt-1 text-muted">
        
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { ethers } from 'ethers';
import sanitizeHtml from 'sanitize-html';
import { useEthers, shortenAddress } from 'vue-dapp';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/resolvers.json";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useUserStore } from '~/store/user';
import ProfileImage from "~/components/profile/ProfileImage.vue";

export default {
  name: "BirdieChatPost",
  props: ["post", "isUserConnectedOrbis"],

  components: {
    ProfileImage
  },

  data() {
    return {
      alreadyLiked: false,
      authorAddress: null,
      authorDomain: null,
      parsedText: null,
    }
  },

  created() {
    if (this.post.creator_details.metadata) {
      this.fetchAuthorDomain();
    }

    this.parsePostText();
  },

  computed: {
    getOrbisImage() {
      if (this.post.creator_details.profile) {
        return this.post.creator_details.profile.pfp;
      }

      return null;
    },

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

        if (secondsPast < 60) return 'now';
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

    async checkIfAlreadyLiked() {
      // check if user has already liked this post
      if (this.isUserConnectedOrbis) {
        let res = await this.$orbis.getReaction(
          String(this.post.stream_id), 
          String(this.userStore.getDidParent) // current user's did
        );

        /** Check if request is successful or not */
        if (res.status == 200) {
          if (res.data && res.data.type === "like") {
            this.alreadyLiked = true; // mark as liked
          }
        }
      }
    },

    async fetchAuthorDomain() {
      // find out if post author has a domain name
      this.authorAddress = this.post.creator_details.metadata.address;

      if (this.authorAddress) {
        // check session storage if author's domain is already stored
        const storedDomain = sessionStorage.getItem(String(this.authorAddress).toLowerCase());

        if (storedDomain) {
          this.authorDomain = storedDomain;
        } else {
          // fetch provider from Alchemy
          let provider = this.$getFallbackProvider(this.$config.supportedChainId);

          if (this.isActivated && this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's MetaMask
            provider = this.signer;
          }

          const contract = new ethers.Contract(resolvers[this.$config.supportedChainId], ResolverAbi, provider);

          // get author's default domain
          const domainName = await contract.getDefaultDomain(
            String(this.authorAddress).toLowerCase(), 
            String(this.$config.tldName).toLowerCase()
          );

          if (domainName) {
            this.authorDomain = domainName + this.$config.tldName;
            sessionStorage.setItem(String(this.authorAddress).toLowerCase(), this.authorDomain);
          } 
        }
      }
    },

    async likePost() {
      if (this.isUserConnectedOrbis && !this.alreadyLiked) {
        // mark as liked
        this.alreadyLiked = true;
        this.post.count_likes++;

        // like the post
        let res = await this.$orbis.react(
          this.post.stream_id,
          "like"
        );

        /** Check if request is successful or not */
        if (res.status !== 200) {
          // if failed request, unmark as liked
          this.alreadyLiked = false;
          this.post.count_likes--;
          console.log("Error liking the post: ", res);
          this.toast(res.result, {type: "error"});
        }
      } else if (this.isUserConnectedOrbis && this.alreadyLiked) {
        // un-mark as liked
        this.alreadyLiked = false;
        this.post.count_likes--;

        // remove reaction ("un-like" the post)
        let res = await this.$orbis.react(
          this.post.stream_id,
          "none" // "none" removes the previous "like" reaction
        );

        /** Check if request is successful or not */
        if (res.status !== 200) {
          // if failed request, mark as liked again
          this.alreadyLiked = true;
          this.post.count_likes++;
          console.log("Error un-liking the post: ", res);
          this.toast(res.result, {type: "error"});
        }
      } else {
        this.toast("Please sign into chat to be able to react on a post.", {type: "warning"});

        // TODO: open a modal to sign into chat instead
      }
    },

    parsePostText() {
      let postText = this.post.content.body;

      postText = sanitizeHtml(postText, {allowedTags: false});

      postText = this.imgParsing(postText);
      this.parsedText = this.urlParsing(postText);
    },

    imgParsing(text) {
      const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

      if (!urlRegex.test(text)) { return text };

      return text.replace(urlRegex, function(url) {
        return '<br/><img class="my-3 img-fluid" src="' + url + '" /><br/>';
      })
    },

    urlParsing(text) {
      const urlRegex = /(https?:\/\/(?!.*\.(jpg|png|jpeg|gif|pdf|docx))[^\s]+)/g;

      if (!urlRegex.test(text)) { return text };

      return text.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
      })
    }
  },

  setup() {
    const { chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return { chainId, isActivated, shortenAddress, signer, toast, userStore }
  },

  watch: {
    isUserConnectedOrbis(newVal, oldVal) {
      if (newVal) {
        this.checkIfAlreadyLiked();
      }
    }
  }
}
</script>

<style scoped>
.bi-heart, .bi-heart-fill {
  cursor: pointer;
}
</style>