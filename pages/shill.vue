<template>
  <Head>
    <Title>Shill and discuss projects | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Shill and discuss projects | ' + $config.projectMetadataTitle" />
  </Head>

  <ChatFeed class="mt-1" :chatContext="$config.chat.contexts.shill" />
</template>

<script>
import ChatFeed from '../components/chat/ChatFeed.vue'

export default {
  name: 'shill',

  components: {
    ChatFeed,
  },
}
</script>
