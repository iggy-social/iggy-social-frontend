<template>
  <Head>
    <Title>Memes & Images | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Memes & Images | ' + $config.projectMetadataTitle" />
  </Head>

  <ChatFeed
    class="mt-1"
    :chatContext="$config.chat.contexts.memesImages"
  />
</template>

<script>
import ChatFeed from '../components/chat/ChatFeed.vue'

export default {
  name: 'MemesImages',

  components: {
    ChatFeed,
  },
}
</script>
