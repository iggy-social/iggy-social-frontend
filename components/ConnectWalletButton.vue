<template>
  <span @click="open">{{ btnText }}</span>
</template>

<script>
import { useVueDappModal } from '@vue-dapp/modal'

export default {
  name: 'ConnectWalletButton',
  props: ['btnText'],

  setup() {
    const { open } = useVueDappModal()
    return {
      open,
    }
  },
}
</script>
