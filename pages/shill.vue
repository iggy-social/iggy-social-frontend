<template>
  <Head>
    <Title>Shill and discuss projects | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Shill and discuss projects | ' + $config.public.projectMetadataTitle" />
  </Head>

  <ChatFeed class="mt-1" :chatContext="$config.public.chat.contexts.shill" />
</template>

<script>
import ChatFeed from '@/components/chat/ChatFeed.vue'

export default {
  name: 'shill',

  components: {
    ChatFeed,
  },
}
</script>
