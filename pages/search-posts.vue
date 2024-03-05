<template>
  <Head>
    <Title>Search posts | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Search posts | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="scroll-500">
    <div class="card border">
      <div class="card-body mb-3">
        <p class="fs-3">
          <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
        </p>

        <h3 class="mt-3">Search posts</h3>
        
        <div class="d-flex justify-content-center mt-5">
          <div class="col-12 col-lg-8">
            <SearchPosts />
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import SearchPosts from '~/components/search/SearchPosts.vue';

export default {
  name: 'SearchPostsPage',

  components: {
    SearchPosts,
  }
}
</script>