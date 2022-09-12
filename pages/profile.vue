<template>
  <div>
    <Head>
      <Title>Profile | Punk Starter Template</Title>
      <Meta name="description" content="Profile page for Punk Starter template" />
    </Head>

    <div class="container">
      <h1>Profile</h1>

      <p>Address: {{ address }}</p>

      <p>Example number from Pinia: {{ exampleStore.exampleNum }}</p>

      <button class="btn btn-primary" @click="showToast">Show toast</button>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers';
import { useExampleStore } from '~/store/example'
import { useToast } from "vue-toastification";

export default {
  name: "Profile",

  created() {
    this.toast("Hello there :)")
  },

  methods: {
    showToast() {
      console.log("toast button clicked");
      this.toast("Hey, this is a toast! :)");
      this.exampleStore.changeNum();
    }
  },

  setup() {
    const { address } = useEthers();
    const exampleStore = useExampleStore();
    const toast = useToast();

    console.log(Number(ethers.utils.parseEther("1.0")));

    return { address, exampleStore, toast };
  }
}
</script>