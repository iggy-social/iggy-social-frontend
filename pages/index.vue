<template>
  <ChatFeed class="mt-1" :showQuotedPost="$config.showRepliesOnHomepage" :orbisContext="getOrbisContext" />
</template>

<script>
import { useEthers } from '~/store/ethers'
import ChatFeed from '../components/chat/ChatFeed.vue'

export default {
  name: 'index',

  components: {
    ChatFeed,
  },

  computed: {
    getOrbisContext() {
      if (this.$config.orbisTest) {
        return this.$config.orbisTestContext
      } else {
        return this.$config.chatChannels.general
      }
    },
  },

  setup() {
    const { address, chainId } = useEthers()

    return { address, chainId }
  },
}
</script>
