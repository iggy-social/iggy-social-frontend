<template>
  <ChatFeed class="mt-1" :hideCommentBox="false" :chatContext="$config.public.chat.contexts.general" />
</template>

<script>
import ChatFeed from '@/components/chat/ChatFeed.vue'
import { useAccountData } from '@/composables/useAccountData'

export default {
  name: 'index',
  components: {
    ChatFeed,
  },

  setup() {
    const { address, chainId } = useAccountData()

    return {
      address,
      chainId,
    }
  },
}
</script>
