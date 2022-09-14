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
import { useToast } from "vue-toastification/dist/index.mjs";
import { Orbis } from "@orbisclub/orbis-sdk";

export default {
  name: "Profile",

  created() {
    this.toast("Hello there :)")
  },

  methods: {
    async connectOrbis() {
      console.log("connect ceramic");
      let orbis = new Orbis();
      console.log("orbis obj");
      let res = await orbis.connect();
      console.log("start connection");
      /** Check if connection is successful or not */
      if(res.status == 200) {
        console.log("DID LOL: " + res.did);
      } else {
        console.log("Error connecting to Ceramic: ", res);
      }
    },

    showToast() {
      console.log("toast button clicked");
      this.toast("Hey, this is a toast! :)");
      this.exampleStore.changeNum();
      console.log("hello hello");
      this.connectOrbis();
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