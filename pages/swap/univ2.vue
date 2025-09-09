<template>
  <Head>
    <Title>Swap | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Token Swap | ' + $config.public.projectMetadataTitle" />
  </Head>

  <div class="scroll-500">
    <div class="card border">
      <div class="card-body mb-3">
        <p class="fs-3">
          <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
        </p>

        <h3 class="mt-3">Token Swap</h3>

        <div class="d-flex justify-content-center mt-5">
          <div class="col-12 col-lg-8">
            <UniV2Swap :routerAddress="$config.public.swapRouterAddress" swapId="SwapPage1" :tokens="tokens" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tokens from '@/data/tokens.json'
import UniV2Swap from '@/components/swap/UniV2Swap.vue'

export default {
  name: 'SwapUniV2',

  components: {
    UniV2Swap,
  },

  setup() {
    return { tokens }
  },
}
</script>
