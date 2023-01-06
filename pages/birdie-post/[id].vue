<template>
  <BirdieChatPost v-if="post" :post="post" :isUserConnectedOrbis="isUserConnectedOrbis" />
</template>

<script>
import BirdieChatPost from "~/components/chat/BirdieChatPost.vue";
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
    BirdieChatPost
  },

  created() {
    this.checkConnectionToOrbis();
    this.getPostObject();
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
      let { data, error } = await this.$orbis.getPost(this.$route.params.id);

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
    const toast = useToast();
    const userStore = useUserStore();

    return {
      toast, 
      userStore 
    }
  },
}
</script>