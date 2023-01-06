<template>
  <div class="container-md">
    <div class="row">
      <div class="col-lg-8">

        <div class="card bg-light mb-3">
          <div class="card-body">
            <div class="form-group mt-2 mb-2">
              <textarea 
                v-model="postText" 
                :disabled="!isUserConnectedOrbis || !isSupportedChain" 
                class="form-control" id="exampleTextarea" rows="3" 
                :placeholder="createPostPlaceholder"
              ></textarea>
            </div>

            <button v-if="isActivated && isUserConnectedOrbis && isSupportedChain" :disabled="!postText" class="btn btn-primary" @click="createPost">Submit</button>
            <button v-if="isActivated && !isUserConnectedOrbis && isSupportedChain" class="btn btn-primary" @click="connectToOrbis">Sign up for chat</button>
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
            <SwitchChainButton v-if="isActivated && !isSupportedChain" :navbar="false" :dropdown="false" />
          </div>
        </div>

        <div v-if="orbisPosts">
          <BirdieChatPost v-for="post in orbisPosts" :key="post.stream_id" :post="post" :isUserConnectedOrbis="isUserConnectedOrbis" />
        </div>

        <div class="d-grid gap-2 col-6 mx-auto mb-5" v-if="showLoadMore">
          <button class="btn btn-primary" type="button" @click="getOrbisPosts">Load more posts</button>
        </div>

      </div>

      <div class="col-lg-4">
        <div class="card bg-light mb-3">
          <div class="card-header">{{$config.tldName}} domains</div>
          <div class="card-body">
            <h4 class="card-title">{{$config.tldName}} domains chat</h4>
            <p class="card-text">
              This is a chat for {{$config.tldName}} domain holders. Get yourself a {{$config.tldName}} domain on 
              Punk Domains (on Optimism).
            </p>

            <a class="btn btn-outline-primary mt-2 mb-2" href="https://punk.domains" target="_blank">Go to Punk Domains</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { useEthers } from 'vue-dapp';
import BirdieChatPost from "~/components/chat/BirdieChatPost.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useUserStore } from '~/store/user';
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import SwitchChainButton from "~/components/SwitchChainButton.vue";

export default {
  name: "BirdieChat",

  components: {
    BirdieChatPost,
    ConnectWalletButton,
    SwitchChainButton
  },

  data() {
    return {
      isUserConnectedOrbis: false,
      orbisPosts: [],
      pageCounter: 0,
      postText: null,
      showLoadMore: true
    }
  },

  created() {
    this.getOrbisPosts();
    this.checkConnectionToOrbis();
  },

  computed: {
    createPostPlaceholder() {
      if (this.isUserConnectedOrbis) {
        return "What's happening?"
      } else if (!this.isActivated) {
        return "What's happening? (Please connect wallet and then sign up for chat to post messages.)"
      } else {
        return "What's happening? (Please sign up for chat to post messages.)"
      }
    },

    getOrbisContext() {
      if (this.$config.orbisTest) {
        return "kjzl6cwe1jw145e1i1agcrjp9375sjpyyk7imu281koehrpve0pr46lvr5e9xco"; // Test Group
      } else {
        return this.$config.orbisContext;
      }
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    async checkConnectionToOrbis() {
      this.isUserConnectedOrbis = await this.$orbis.isConnected();

      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },

    async connectToOrbis() {
      let res = await this.$orbis.connect(this.signer.provider.provider, false);

      /** Check if connection is successful or not */
      if(res.status == 200) {
        this.isUserConnectedOrbis = true;

        if (this.$orbis.session) {
          this.userStore.setDid(this.$orbis.session.did._id);
          this.userStore.setDidParent(this.$orbis.session.did._parentId);
        }
      } else {
        console.log("Error connecting to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
      }
    },

    async createPost() {
      // post on Orbis & Ceramic
      let res = await this.$orbis.createPost({
        body: this.postText, 
        context: this.getOrbisContext
      });

      /** Check if posting is successful or not */
      if(res.status == 200) {
        // post on current feed
        this.orbisPosts.unshift({
          stream_id: res.doc,
          count_likes: 0,
          timestamp: Math.floor(Date.now() / 1000),
          creator_details: {
            metadata: {
              address: this.address
            }
          },
          content: {
            body: this.postText
          }
        });

        this.postText = null;
      } else {
        console.log("Error posting via Orbis to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
      }
    },

    async getOrbisPosts() {
      let { data, error } = await this.$orbis.getPosts(
        {context: this.getOrbisContext},
        this.pageCounter
      );

      if (error) {
        this.toast("Orbis error", {type: "error"});
        this.toast(error, {type: "error"});
      }

      //console.log("data:");
      //console.log(data);

      if (data.length < 50) {
        this.showLoadMore = false; // hide Load More Posts button if there's less than 50 posts received
      } else if (data.length === 50) {
        this.showLoadMore = true; // show Load More Posts button if data length was full (50 posts)
      }

      this.orbisPosts.push(...data);

      this.pageCounter++;
    },

    
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return { address, chainId, isActivated, signer, toast, userStore }
  },
}
</script>
