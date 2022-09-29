<template>
  <div class="container-md">
    <div class="row">
      <div class="col-md-8">

        <BirdieChatPost v-for="post in orbisPosts" :key="post" :post="post" />

      </div>

      <div class="col-md-4">
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
import BirdieChatPost from "./BirdieChatPost.vue"

export default {
  name: "BirdieChat",

  components: {
    BirdieChatPost
  },

  data() {
    return {
      orbisPosts: null,
    }
  },

  created() {
    this.getOrbisPosts();
  },

  methods: {
    async getOrbisPosts() {
      let { data, error, status } = await this.$orbis.getPosts({context: "kjzl6cwe1jw14bmb4kgw6gbu6umo8jz9vxjsunueihadbpr9977tj93s2diycb1"});

      console.log("status:");
      console.log(status);
      console.log("error:");
      console.log(error);
      console.log("data:");
      console.log(data);

      this.orbisPosts = data;
    }
  },
}
</script>
