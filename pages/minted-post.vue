<template>
  <div>
    <Head>
      <Title>Post NFT | {{ $config.projectMetadataTitle }}</Title>
      <Meta property="og:title" :content="'Post NFT | ' + $config.projectMetadataTitle" />

      <Meta name="description" :content="'Check out this minted post NFT on ' + $config.projectName + '!'" />

      <Meta property="og:image" :content="$config.projectUrl+$config.previewImagePostNft" />
      <Meta property="og:description" :content="'Check out this minted post NFT on ' + $config.projectName + '!'" />

      <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImagePostNft" />
      <Meta name="twitter:description" :content="'Check out this minted post NFT on ' + $config.projectName + '!'" />
    </Head>

    <!-- Minted Post Image -->
    <div class="card mb-3 border scroll-500" v-if="image">
      <div class="card-body row">
        <p class="fs-3" @click="$router.back()">
          <i class="bi bi-arrow-left-circle cursor-pointer"></i>
        </p>

        <div class="col-sm-12 col-md-6 offset-md-3 mb-3">
          <img class="img-fluid rounded" :src="image" />
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="card mb-3 border" v-if="image">
      <div class="card-body">
        <h4 class="mb-3 text-body">Info</h4>

        <ul class="text-break">
          <li>NFT ID: {{ getQueryId }}</li>
          <li>First minted on: {{ created }}</li>
          <li v-if="currentUserBalance || currentUserBalance === 0">
            You own <span class="text-primary">{{ currentUserBalance }}</span> of these post NFTs
          </li>
          <li>
            <a class="text-decoration-none" target="_blank" :href="$config.marketplacePostNftItemUrl+getQueryId">
              See it on NFT marketplace 
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
          <li>
            <a class="text-decoration-none" target="_blank" :href="$config.blockExplorerBaseUrl+'/token/'+$config.iggyPostAddress">
              Smart contract on block explorer 
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  
    <!-- orbis post which has been minted -->
    <ChatPost v-if="post" :post="post" :showQuotedPost="true" :orbisContext="getOrbisContext" />
  </div>
</template>

<script>
import ChatPost from "~/components/chat/ChatPost.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { ethers } from "ethers";
import { useEthers } from 'vue-dapp';

export default {
  data() {
    return {
      created: null,
      currentUserBalance: null,
      image: null,
      post: null
    }
  },

  components: {
    ChatPost
  },

  mounted() {
    this.getPostObject();
  },

  computed: {
    getOrbisContext() {
      if (this.$config.orbisTest) {
        return this.$config.orbisTestContext;
      } else {
        return this.$config.orbisContext;
      }
    },
    
    getPostAuthor() {
      if (this.post) {
        return this.post.creator_details.metadata.address;
      }

      return null;
    },

    getQueryId() {
      return this.route.query.id;
    }
  },

  methods: {
    async getPostObject() {
      this.post = null;
      const nftId = this.route.query.id;

      let uri = localStorage.getItem("minted-post-" + nftId);

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      // create iggy post interface
      const iggyPostInterface = new ethers.utils.Interface([
        "function balanceOf(address _owner, uint256 _tokenId) external view returns (uint256)",
        "function doesPostExist(string memory _postId, address _authorId) external view returns (bool)",
        "function uri(uint256 _tokenId) public view returns (string memory)"
      ]);

      // create iggy post contract
      const iggyPostContract = new ethers.Contract(
        this.$config.iggyPostAddress,
        iggyPostInterface,
        provider
      );

      if (!uri) {
        // fetch uri from iggy post contract
        uri = await iggyPostContract.uri(nftId);

        // store uri in local storage
        localStorage.setItem("minted-post-" + nftId, uri);
      }

      // json parse uri
      const json = atob(uri.substring(29));
      const result = JSON.parse(json);

      const postId = result["external_url"].split("?id=").pop();

      this.image = result["image"];

      const createdTimestamp = result["attributes"][2]["value"];
      const options = { year: 'numeric', month: 'long', day: 'numeric' };

      this.created = new Date(createdTimestamp * 1000).toLocaleDateString("en-US", options);

      let { data, error } = await this.$orbis.getPost(postId);

      this.post = data;

      if (error) {
        console.log("Orbis error:", error);
        this.toast("The post has been deleted.", {type: "warning"});
      }

      // fetch balanceOf of current user
      if (this.address) {
        // check session storage for balance
        this.currentUserBalance = sessionStorage.getItem("balanceOf-" + this.address + "-postNft-" + nftId);

        if (!this.currentUserBalance) {
          this.currentUserBalance = Number(await iggyPostContract.balanceOf(this.address, nftId));

          // store balance in session storage
          sessionStorage.setItem("balanceOf-" + this.address + "-postNft-" + nftId, this.currentUserBalance);
        }
      }
    }
  },

  setup() {
    const route = useRoute();
    const toast = useToast();
    const { address, isActivated, chainId, signer } = useEthers();

    return {
      address,
      isActivated,
      chainId,
      route,
      signer,
      toast
    }
  },

  watch: {
    getQueryId(val, oldVal) {
      // refresh post object if id in query has changed
      this.getPostObject();
    }
  },
}
</script>