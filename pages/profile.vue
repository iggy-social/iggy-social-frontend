<template>
  <div>
    <Head>
      <Title>Profile | Punk Starter Template</Title>
      <Meta name="description" content="Profile page for Punk Starter template" />
    </Head>

    <div class="container">
      <h1>Profile</h1>

      <p>Address: {{ address }}</p>

      <p>Example number from Pinia: {{ exampleNum }}</p>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers';
import { useExampleStore } from '~/store/example'

export default {
  name: "Profile",

  setup() {
    const { address } = useEthers();
    const exampleStore = useExampleStore();

    const exampleNum = exampleStore.getExampleNum;

    console.log(Number(ethers.utils.parseEther("1.0")));

    return { address, exampleNum };
  }
}
</script>