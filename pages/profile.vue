<template>
  <Head>
    <Title>Profile | {{ $config.projectMetadataTitle }}</Title>
    <Meta name="description" :content="'Check out this profile on ' + $config.projectName + '!'" />

    <Meta property="og:image" :content="$config.projectUrl+$config.previewImageProfile" />
    <Meta property="og:description" :content="'Check out this profile on ' + $config.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImageProfile" />
    <Meta name="twitter:description" :content="'Check out this profile on ' + $config.projectName + '!'" />
  </Head>

  <PunkProfile :key="$route.query.id" class="mt-1" />
</template>

<script>
import PunkProfile from '~/components/profile/PunkProfile.vue'

export default {
  name: "Profile",

  components: {
    PunkProfile
  },

  setup() {

  }
}
</script>
