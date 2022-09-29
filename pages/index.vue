<template>
  <BirdieChat class="mt-3" />
</template>

<script>
import { useEthers } from 'vue-dapp'
import BirdieChat from "../components/chat/BirdieChat.vue"

export default {
  name: "index",

  components: {
    BirdieChat
  },

  setup() {
    const { address, chainId } = useEthers()

    return { address, chainId }
  }
}
</script>