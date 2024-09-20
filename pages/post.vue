<template>
  <div>
    <Head>
      <Meta name="description" :content="'Check out this chat post on ' + $config.projectName + '!'" />

      <Meta property="og:image" :content="$config.projectUrl + $config.previewImagePost" />
      <Meta property="og:description" :content="'Check out this chat post on ' + $config.projectName + '!'" />

      <Meta name="twitter:image" :content="$config.projectUrl + $config.previewImagePost" />
      <Meta name="twitter:description" :content="'Check out this chat post on ' + $config.projectName + '!'" />
    </Head>
  </div>
</template>

<script>
import ChatPost from '~/components/chat/ChatPost.vue'
import ChatFeed from '~/components/chat/ChatFeed.vue'
import { useToast } from 'vue-toastification/dist/index.mjs'

export default {

  components: {
    ChatFeed,
    ChatPost,
  },

  computed: {
    getQueryId() {
      return this.route.query.id
    },
  },

  setup() {
    const route = useRoute()
    const toast = useToast()

    return {
      route,
      toast,
    }
  },

  watch: {
    getQueryId(val, oldVal) {
      // TODO: refresh post object if id in query has changed
      
    },
  },
}
</script>
