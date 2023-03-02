<template>
  <Head>
    <Title>About Iggy Social</Title>
    <Meta name="description" content="Profile page" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3">Web3 Social is here.</h3>

      <p class="text-break mt-3">
        Iggy Social helps DAOs and other web3 communities launch their own web3 social platform. Let's leave the old world of 
        corporation-controled social media behind us and move towards a decentralized future. We promise, it's going to be a lot of fun!
      </p>

      <p class="text-break mt-3">
        Built on top of Orbis, Ceramic Network, and the Punk Domains protocol.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>