<template>
  <Head>
    <Title>Profile | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta name="description" :content="'Check out this profile on ' + $config.public.projectName + '!'" />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageProfile" />
    <Meta property="og:description" :content="'Check out this profile on ' + $config.public.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageProfile" />
    <Meta name="twitter:description" :content="'Check out this profile on ' + $config.public.projectName + '!'" />
  </Head>

  <PunkProfile :key="$route.query.id" class="mt-1" />
</template>

<script>
import PunkProfile from '@/components/profile/PunkProfile.vue'

export default {
  name: 'Profile',

  components: {
    PunkProfile,
  },
}
</script>
