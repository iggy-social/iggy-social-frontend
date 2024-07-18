<template>
  <img :src="imgPath" :alt="domainName" />
</template>

<script>
import { getWorkingUrl } from '~/utils/ipfsUtils'

export default {
  name: 'ProfileImage',
  props: ['address', 'domain', 'image'],

  data() {
    return {
      imgPath: null,
      defaultImage: '/img/user/anon.svg',
    }
  },

  created() {
    this.imgPath = this.defaultImage
  },

  mounted() {
    const storedImage = sessionStorage.getItem(String(this.address).toLowerCase() + '-img')

    if (storedImage) {
      this.imgPath = storedImage
    }
    
    this.fetchProfilePicture()
  },

  computed: {
    domainName() {
      if (!this.domain) {
        return null
      }

      return this.domain.replace(this.$config.tldName, '')
    },
  },

  methods: {

    async fetchProfilePicture() {
      this.imgPath = this.defaultImage

      if (this.image) {
        const prefetchRes = await getWorkingUrl(this.image)

        if (prefetchRes.success) {
          sessionStorage.setItem(String(this.address).toLowerCase() + '-img', prefetchRes.url)
          return this.imgPath = prefetchRes.url
        }
      }
    }

  },

  watch: {
    /*
    image(oldValue, newValue) {
      if (newValue) {
        this.fetchProfilePicture()
      }
    },
    */
  },
}
</script>
