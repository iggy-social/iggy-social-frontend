<template>
  <ChatFeed class="mt-1" :hideCommentBox="false" :chatContext="$config.public.chat.contexts.general" />
</template>

<script>
import ChatFeed from '@/components/chat/ChatFeed.vue'

export default {
  name: 'index',
  components: {
    ChatFeed,
  },
}
</script>
