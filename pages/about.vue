<template>
  <Head>
    <Title>About | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'About | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3">Web3 Social is here.</h3>

      <p class="text-break mt-3">
        Iggy Social Demo is showcase of an open-source template that anyone can use to build their own web3 social app.
      </p>

      <p class="text-break mt-3">
        Web3 Social is a place where social media is fully decentralized, permissionless and all the data is owned by users. 
        The way it should be.
      </p>

      <p class="text-break mt-3">
        Let's leave the old world of corporation-controlled social media behind us and move towards a decentralized future. 
        We promise, it's going to be a lot of fun!
      </p>

      <p class="text-break mt-3">
        Brought to you by the 
        <a target="_blank" href="https://punk.domains">Punk Domains</a> team.
      </p>

      <h5>Useful links</h5>

      <ul>
        <li><a href="https://github.com/iggy-social" target="_blank">Iggy Social GitHub</a></li>
        <li><a href="https://github.com/punk-domains" target="_blank">Punk Domains GitHub</a></li>
        <li><a href="https://discord.gg/8dSrwrAQeu" target="_blank">Discord</a></li>
      </ul>

      <h5>Tech stack</h5>

      <p class="text-break mt-3">
        This chat is built on top of various decentralized and open source technologies, such as:
      </p>

      <ul>
        <li><a href="https://ipfs.tech/" target="_blank">IPFS</a></li>
        <li><a href="https://ceramic.network/" target="_blank">Ceramic Network</a></li>
        <li><a href="https://useorbis.com/" target="_blank">Orbis</a></li>
        <li><a href="https://punk.domains/" target="_blank">Punk Domains</a></li>
        <li><a href="https://iggy.social/" target="_blank">Iggy Social</a></li>
        <li>... and others.</li>
      </ul>

      <hr />

      <h5>Feedback</h5>

      <p class="text-break mt-3">
        Feel free to post ideas, features suggestions, rants directly in this chat. 
      </p>

    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>