<template>
  <div class="container">
    <Head>
      <Title>Profile | Punk Starter Template</Title>
      <Meta name="description" content="Profile page for Punk Starter template" />
    </Head>

    <div class="container mt-4">
      <h1>Profile</h1>

      <p>Theme: <a href="https://bootswatch.com/zephyr/" target="_blank">Zephyr</a></p>

      <p class="text-break">Address: {{ address }}</p>

      <p>Chain: {{ $getChainName(chainId) }}</p>

      <button class="btn btn-primary" @click="showToast">Show toast</button>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers';
import { useExampleStore } from '~/store/example'
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  name: "Profile",

  methods: {
    showToast() {
      console.log("toast button clicked");
      this.toast("Hey, this is a toast! :)");
      //this.connectOrbis();
    }
  },

  setup() {
    const { address, chainId } = useEthers();
    const exampleStore = useExampleStore();
    const toast = useToast();

    console.log(Number(ethers.utils.parseEther("1.0")));

    return { address, chainId, exampleStore, toast };
  }
}
</script>

<style scoped>
.container {}
</style>