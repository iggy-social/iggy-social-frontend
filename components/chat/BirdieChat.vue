<template>
  <div class="container-md">
    <div class="row">
      <div class="col-lg-8">

        <button class="btn btn-primary mb-3" @click="createPost">Add new post</button>

        <div v-if="orbisPosts">
          <BirdieChatPost v-for="post in orbisPosts" :key="post.stream_id" :post="post" />
        </div>

        <div class="d-grid gap-2 col-6 mx-auto mb-5" v-if="showLoadMore">
          <button class="btn btn-primary" type="button" @click="getOrbisPosts">Load more posts</button>
        </div>

      </div>

      <div class="col-lg-4">
        <div class="card bg-light mb-3">
          <div class="card-header">Sidebar</div>
          <div class="card-body">
            <h4 class="card-title">Useful widget</h4>
            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
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
      orbisPosts: [],
      pageCounter: 0,
      showLoadMore: true
    }
  },

  created() {
    this.getOrbisPosts();
  },

  methods: {
    async createPost() {
      const newPost = {
        timestamp: 1664528734,
        creator_details: {
          metadata: {
            address: this.address
          }
        },
        content: {
          body: "This is the content of the post itself <a href='https://punk.domains'>Link</a>"
        }
      };

      this.orbisPosts.unshift(newPost);
    },

    async getOrbisPosts() {
      let { data, error } = await this.$orbis.getPosts(
        {context: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1"},
        //{context: "kjzl6cwe1jw14ai2gg8e0qmx2j944ppe3s3dgfk003jlb8guuybyg4m77nsrg73"}, 
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
    }
  },

  setup() {
    const { address } = useEthers();
    const toast = useToast();

    return { address, toast }
  },
}
</script>
