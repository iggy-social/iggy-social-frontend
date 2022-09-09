<template>
  <div>
    <Head>
      <Title>Profile | Punk Starter Template</Title>
      <Meta name="description" content="Profile page for Punk Starter template" />
    </Head>

    <div class="container">
      <h1>Profile</h1>

      <p>Address: {{ address }}</p>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp'

export default {
  name: "Profile",

  setup() {
    const { address } = useEthers();

    return { address };
  }
}
</script>