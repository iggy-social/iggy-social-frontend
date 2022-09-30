<template>
  <div class="container-md">
    <div class="row">
      <div class="col-lg-8">

        <div v-if="isActivated" class="card bg-light mb-3">
          <div class="card-body">
            <div class="form-group mt-2">
              <textarea 
                v-model="postText" 
                :disabled="!isUserConnectedOrbis" 
                class="form-control" id="exampleTextarea" rows="3" 
                :placeholder="createPostPlaceholder"
              ></textarea>
            </div>

            <button v-if="isUserConnectedOrbis" :disabled="!postText" class="btn btn-primary mt-2 mb-2" @click="createPost">Submit</button>
            <button v-if="!isUserConnectedOrbis" class="btn btn-primary mt-2 mb-2" @click="connectToOrbis">Connect to chat</button>
          </div>
        </div>

        <div v-if="orbisPosts">
          <BirdieChatPost v-for="post in orbisPosts" :key="post.stream_id" :post="post" />
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
import BirdieChatPost from "./BirdieChatPost.vue";
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  name: "BirdieChat",

  components: {
    BirdieChatPost
  },

  data() {
    return {
      isUserConnectedOrbis: false,
      orbisContext: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1", // kjzl6cwe1jw14ai2gg8e0qmx2j944ppe3s3dgfk003jlb8guuybyg4m77nsrg73
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
      } else {
        return "What's happening? (Please connect to chat to post messages.)"
      }
    }
  },

  methods: {
    async checkConnectionToOrbis() {
      this.isUserConnectedOrbis = await this.$orbis.isConnected();
    },

    async connectToOrbis() {
      let res = await this.$orbis.connect(this.signer.provider.provider, false);

      /** Check if connection is successful or not */
      if(res.status == 200) {
        this.isUserConnectedOrbis = true;
      } else {
        console.log("Error connecting to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
      }
    },

    async createPost() {
      // post on Orbis & Ceramic
      let res = await this.$orbis.createPost({
        body: this.postText, 
        context: this.orbisContext
      });

      /** Check if posting is successful or not */
      if(res.status == 200) {
        // post on current feed
        const newPost = {
          timestamp: Math.floor(Date.now() / 1000),
          creator_details: {
            metadata: {
              address: this.address
            }
          },
          content: {
            body: this.postText
          }
        };

        this.orbisPosts.unshift(newPost);
        this.postText = null;
      } else {
        console.log("Error posting via Orbis to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
      }
    },

    async getOrbisPosts() {
      let { data, error } = await this.$orbis.getPosts(
        {context: this.orbisContext},
        this.pageCounter
      );

      if (error) {
        this.toast("Orbis error", {type: "error"});
        this.toast(error, {type: "error"});
      }

      console.log("data:");
      console.log(data);

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
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();

    return { address, isActivated, signer, toast }
  },
}
</script>
