<template>
  <div>
    <Head>
      <Title>Punk Starter Template</Title>
      <Meta name="description" content="Punk Starter template with Nuxt 3 and Vue Dapp" />
      <Link rel="stylesheet" :href="'/css/'+siteStore.getColorMode" />
    </Head>

    <Navbar />

    <slot></slot>    
  </div>
</template>

<script>
import { MetaMaskConnector, useEthers, useWallet } from 'vue-dapp';
import { useSiteStore } from '~/store/site';
import { useLocalStorage } from '@vueuse/core';

export default {
  setup() {
    const siteStore = useSiteStore();
    const { isActivated } = useEthers();
    const { connectWith, wallet } = useWallet();

    const connectedType = useLocalStorage('connected', null); // when connectedType.value is updated, localStorage is updated too

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && connectedType.value == "metamask") {
        const connector = new MetaMaskConnector();
        connectWith(connector);
      }
    })

    watch(isActivated, (newValue, oldValue) => {
      if (newValue) {
        connectedType.value = String(wallet.connector.name).toLowerCase(); // "connected" value in localStorage updated
      } else {
        connectedType.value = null; // "connected" value in localStorage deleted
      }
    });
    
    return { siteStore }
  }
}
</script>