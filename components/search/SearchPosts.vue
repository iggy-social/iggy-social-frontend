<template>
  <div>
    <div class="input-group mb-3">
      <input 
        type="text" 
        class="form-control text-center" 
        placeholder="enter a search term" 
        v-model="queryTerm"
        v-on:keyup.enter="search"
      >
    </div>

    <div class="dropdown d-flex justify-content-center mb-4">
      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ selectedContextName }}
      </button>
      <ul class="dropdown-menu">
        <li><button class="dropdown-item" @click="chooseContext('general')">General discussion</button></li>
        <li><button class="dropdown-item" @click="chooseContext('memesImages')">Share Images & NFTs</button></li>
        <li><button class="dropdown-item" @click="chooseContext('shill')">Shill & discuss projects</button></li>
      </ul>
    </div>

    <div class="text-center">
      <button class="btn btn-primary mt-2 mb-4" :disabled="!queryTerm || waitingLoadPosts" @click="search">
        Search
      </button>
    </div>
    
    <div v-if="orbisPosts">
      <ChatPost  
        v-for="post in orbisPosts" 
        :key="post.stream_id"
        :post="post"
        :orbisContext="selectedContext" />
    </div>

    <div class="d-flex justify-content-center mt-5 mb-4" v-if="searched && queryTerm && orbisPosts.length === 0 && !waitingLoadPosts">
      <p>No posts. Try a different query.</p>
    </div>

    <div class="d-flex justify-content-center mb-3" v-if="waitingLoadPosts">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>
    
    <div class="d-grid gap-2 col-6 mx-auto mb-5" v-if="showLoadMore">
      <button class="btn btn-primary" type="button" @click="search">Load more posts</button>
    </div>
  </div>
</template>

<script>
import ChatPost from "~/components/chat/ChatPost.vue";
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  name: "SearchPosts",

  data() {
    return {
      orbisPosts: [],
      pageCounter: 0,
      queryTerm: null,
      searched: false,
      selectedContext: this.$config.chatChannels.general,
      selectedContextName: "General discussion",
      showLoadMore: false,
      waitingLoadPosts: false
    }
  },

  components: {
    ChatPost
  },

  methods: {
    chooseContext(contextId) {
      this.orbisPosts = [];
      this.pageCounter = 0;
      this.searched = false;

      this.selectedContext = this.$config.chatChannels[contextId];
      console.log(this.selectedContext);

      switch (contextId) {
        case "general":
          this.selectedContextName = "General discussion";
          break;
        case "memesImages":
          this.selectedContextName = "Share Images & NFTs";
          break;
        case "shill":
          this.selectedContextName = "Shill & discuss projects";
          break;
      }
    },

    async search() {
      this.waitingLoadPosts = true;

      let {data, error} = await this.$orbis.getPosts(
        {context: this.selectedContext, term: this.queryTerm}, 
        this.pageCounter, 
        this.$config.getPostsLimit, // posts limit
        false // ascending=true, descending=false
      );

      if (error) {
        this.toast("Error fetching posts from the Orbis/Ceramic node.", {type: "error"});
        console.log(error);
      }

      if (data.length < this.$config.getPostsLimit) {
        this.showLoadMore = false; // hide Load More Posts button if there's less than getPostsLimit number of posts received
      } else if (data.length === this.$config.getPostsLimit) {
        this.showLoadMore = true; // show Load More Posts button if data length was full (getPostsLimit number of posts)
      }

      this.orbisPosts.push(...data);

      this.pageCounter++;

      this.waitingLoadPosts = false;
      this.searched = true;
    }
  },

  setup() {
    const toast = useToast();

    return { toast }
  },

  watch: {
    // if queryTerm changes, clear the orbisPosts array
    queryTerm(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.orbisPosts = [];
        this.pageCounter = 0;
        this.searched = false;
      }
    }
  }
}
</script>