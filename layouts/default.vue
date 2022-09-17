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
import { useSiteStore } from '~/store/site'

export default {
  setup() {
    const siteStore = useSiteStore();
    
    return { siteStore }
  }
}
</script>