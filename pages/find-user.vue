<template>
  <Head>
    <Title>Find user | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Find user | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="scroll-500">
    <div class="card border">
      <div class="card-body mb-3">
        <p class="fs-3">
          <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
        </p>

        <h3 class="mt-3">Find user</h3>
        
        <div class="d-flex justify-content-center mt-5">
          <div class="col-12 col-lg-8">
            <FindUser />
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import FindUser from '~/components/search/FindUser.vue';

export default {
  name: 'FindUserPage',

  components: {
    FindUser,
  }
}
</script>