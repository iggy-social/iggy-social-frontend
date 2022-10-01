<template>
  <span @click="open">{{btnText}}</span>
</template>

<script>
import { useBoard } from 'vue-dapp'

export default {
  name: "ConnectWalletButton",
  props: ["btnText"],

  setup() {
    const { open } = useBoard();
    return { open }
  },
}
</script>