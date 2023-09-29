<template>
<div class="card mb-3 border" v-if="post">
  <div class="card-body row">
    <div class="col-2 col-md-1">
      <NuxtLink :to="'/profile/?id='+String(showDomainOrFullAddress)">
        <ProfileImage 
          class="img-fluid rounded-circle"
          :address="authorAddress" 
          :domain="authorDomain"
          :image="getOrbisImage"
        />
      </NuxtLink>
    </div>

    <div class="col-10 col-md-11">
      
      <!-- post author and timestamp -->
      <p class="card-subtitle mb-1 text-muted">
        <NuxtLink v-if="authorDomain" class="link-without-color hover-color" :to="'/profile/?id='+authorDomain">{{showDomainOrAddressOrAnon}}</NuxtLink>
        <span v-if="!authorDomain">{{showDomainOrAddressOrAnon}}</span>
      </p>

      <!-- post text -->
      <div v-if="post.body" @click="openPostDetails">
        <p
          class="card-text text-break"
          v-if="parsedText.length > postLengthLimit && !showFullText"
        >
          <span 
            v-html="parsedText.substring(0, postLengthLimit) + ' ... '">
          </span>
          <span class="cursor-pointer hover-color" @click="showFullText = true">Read more</span>
        </p>

        <p v-if="parsedText.length < postLengthLimit || showFullText" class="card-text text-break" v-html="parsedText"></p>
      </div>

      <div v-if="!post.body">
        <p class="card-text"><small><em>(deleted)</em></small></p>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import { ethers } from 'ethers';
import sanitizeHtml from 'sanitize-html';
import { useEthers, shortenAddress } from 'vue-dapp';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/data/resolvers.json";
import { useUserStore } from '~/store/user';
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { imgParsing, imgWithoutExtensionParsing, urlParsing, youtubeParsing } from '~/utils/textUtils';
import { fetchUsername, storeUsername } from '~/utils/storageUtils';
import { getTextWithoutBlankCharacters } from '~/utils/textUtils';

export default {
  name: "ChatQuote",
  props: ["post"], // quote post: body, stream_id, pfp, username, address

  components: {
    ProfileImage
  },

  data() {
    return {
      authorAddress: null,
      authorDomain: null,
      parsedText: null,
      postLengthLimit: 300,
      showFullText: false
    }
  },

  created() {
    if (this.post.address) {
      this.fetchAuthorDomain();
    }

    this.parsePostText();
  },

  computed: {
    getOrbisImage() {
      if (this.post.pfp) {
        return this.post.pfp;
      }

      return null;
    },

    showDomainOrAddressOrAnon() {
      if (this.authorDomain) {
        return getTextWithoutBlankCharacters(this.authorDomain);
      } else if (this.post.address) {
        return this.shortenAddress(this.post.address);
      } else {
        return "Anon";
      }
    },

    showDomainOrFullAddress() {
      if (this.authorDomain) {
        return this.authorDomain;
      } else if (this.post.address) {
        return this.post.address;
      }

      return null;
    },
  },

  methods: {
    async fetchAuthorDomain() {
      // find out if post author has a domain name
      this.authorAddress = this.post.address;

      if (this.authorAddress) {
        // check storage if author's domain is already stored
        const storedDomain = fetchUsername(window, this.authorAddress);

        if (storedDomain) {
          this.authorDomain = storedDomain;
        } else {
          // fetch provider from hardcoded RPCs
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
            storeUsername(window, this.authorAddress, this.authorDomain);
          } 
        }
      }
    },

    openPostDetails() {
      this.$router.push({ name: 'post', query: { id: this.post.stream_id } });
    },

    parsePostText() {
      let postText = this.post.body;

      postText = sanitizeHtml(postText, {
        allowedTags: [ 'li', 'ul', 'ol', 'br', 'em', 'strong', 'i', 'b' ],
        allowedAttributes: {}
      });

      postText = imgParsing(postText);
      postText = imgWithoutExtensionParsing(postText);
      postText = youtubeParsing(postText);
      postText = urlParsing(postText);

      this.parsedText = postText.replace(/(\r\n|\n|\r)/gm, "<br/>");
    }
  },

  setup() {
    const route = useRoute();
    const { address, chainId, isActivated, signer } = useEthers();
    const userStore = useUserStore();

    return { address, chainId, isActivated, route, shortenAddress, signer, userStore }
  },
}
</script>