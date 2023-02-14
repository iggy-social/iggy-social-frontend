<template>
  <Head>
    <Title>Profile</Title>
    <Meta name="description" content="Profile page" />
  </Head>

  <PunkProfile class="mt-1" />
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
