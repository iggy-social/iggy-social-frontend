<template>
  <Head>
    <Title>Chat Post</Title>
    <Meta name="description" content="Chat general description" />
  </Head>

  <!-- TODO: show component based on the chat type selection (Birdie, Forum, smth else) -->
  <BirdieChatPost v-if="post" :post="post" :isUserConnectedOrbis="isUserConnectedOrbis" />

  <BirdieChat v-if="post" :id="post.stream_id" />
</template>

<script>
import BirdieChatPost from "~~/components/chat/birdie/BirdieChatPost.vue";
import BirdieChat from "~~/components/chat/birdie/BirdieChat.vue";
import { useUserStore } from '~/store/user';
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  data() {
    return {
      post: null,
      isUserConnectedOrbis: null
    }
  },

  components: {
    BirdieChat,
    BirdieChatPost
  },

  created() {
    this.checkConnectionToOrbis();
    this.getPostObject();
  },

  computed: {
    getPostAuthor() {
      if (this.post) {
        return this.post.creator_details.metadata.address;
      }

      return null;
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

    async getPostObject() {
      let { data, error } = await this.$orbis.getPost(this.route.query.id);

      //console.log("data:")
      //console.log(data)

      this.post = data;

      if (error) {
        console.log("Orbis error");
        console.log(error)
        this.toast("Orbis error", {type: "error"});
        this.toast(error, {type: "error"});
      }
    }
  },

  setup() {
    const route = useRoute();
    const toast = useToast();
    const userStore = useUserStore();

    return {
      route,
      toast, 
      userStore 
    }
  },
}
</script>