<template>
  <Head>
    <Title>Memes & Images | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Memes & Images | ' + $config.public.projectMetadataTitle" />
  </Head>

  <ChatFeed
    class="mt-1"
    :chatContext="$config.public.chat.contexts.memesImages"
  />
</template>

<script>
import ChatFeed from '@/components/chat/ChatFeed.vue'

export default {
  name: 'MemesImages',

  components: {
    ChatFeed,
  },
}
</script>
