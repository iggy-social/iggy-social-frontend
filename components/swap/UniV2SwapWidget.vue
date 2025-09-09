<template>
  <div class="card m-2 bg-light">
    <div class="card-header bg-light">{{ title }}</div>

    <div class="card-body sidebar-card-body">
      <UniV2Swap
        class="mt-3"
        :routerAddress="routerAddress"
        swapId="SidebarRight1"
        :tokens="tokens"
        :poweredBy="poweredBy"
      />
    </div>
  </div>
</template>

<script>
import UniV2Swap from '@/components/swap/UniV2Swap.vue'

export default {
  name: 'UniV2SwapWidget',
  props: ['poweredBy', 'routerAddress', 'title', 'tokens'],

  components: { UniV2Swap },
}
</script>
