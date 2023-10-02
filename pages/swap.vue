<template>
  <Head>
    <Title>Swap | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Token Swap | ' + $config.projectMetadataTitle" />
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
            <SimpleSwap 
              :routerAddress="$config.swapRouterAddress" 
              swapId="SwapPage1" 
              :tokens="tokens"
            />
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import tokens from '~/assets/data/tokens.json';
import SimpleSwap from '~/components/swap/SimpleSwap.vue';

export default {
  name: 'Swap',

  components: {
    SimpleSwap,
  },

  setup() {
    return { tokens };
  }
}
</script>