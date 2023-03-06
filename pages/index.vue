<template>
  <AlienChat class="mt-1" />
</template>

<script>
import { useEthers } from 'vue-dapp'
import AlienChat from "../components/chat/alien/AlienChat.vue"

export default {
  name: "index",

  components: {
    AlienChat
  },

  setup() {
    const { address, chainId } = useEthers()

    return { address, chainId }
  }
}
</script>