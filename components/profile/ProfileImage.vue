<template>
  <img :src="parseImageLink" />
</template>

<script>
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
    } else if (this.image) {
      this.imgPath = this.image
      sessionStorage.setItem(String(this.address).toLowerCase() + '-img', this.image)
    }
  },

  computed: {
    parseImageLink() {
      let parsedImage = this.imgPath

      if (parsedImage && parsedImage.includes('ipfs://')) {
        parsedImage = parsedImage.replace('ipfs://', this.$config.ipfsGateway)
      }

      return parsedImage
    },
  },

  watch: {
    image(oldValue, newValue) {
      if (newValue) {
        this.imgPath = newValue
        sessionStorage.setItem(String(this.address).toLowerCase() + '-img', this.image)
      }
    },
  },
}
</script>
