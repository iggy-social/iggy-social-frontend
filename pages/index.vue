<template>
  <ChatFeed class="mt-1" :hideCommentBox="false" :chatContext="$config.chat.contexts.general" />
</template>

<script>
import { useEthers } from '~/store/ethers'
import ChatFeed from '../components/chat/ChatFeed.vue'

export default {
  name: 'index',

  components: {
    ChatFeed,
  },

  setup() {
    const { address, chainId } = useEthers()

    return { address, chainId }
  },
}
</script>
