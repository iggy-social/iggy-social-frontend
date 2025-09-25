<template>
  <img :src="imgPath" :alt="domainName" class="rounded-circle" />
</template>

<script>
import { useAccount, useConfig } from '@wagmi/vue'
import { fetchData, storeData } from '@/utils/browserStorageUtils'
import { readData } from '@/utils/contractUtils'
import { getWorkingUrl } from '@/utils/fileUtils'

export default {
  name: 'ProfileImage',
  props: ['domain', 'image'],

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
    this.fetchProfilePicture()
  },

  computed: {
    domainName() {
      if (!this.domain) {
        return null
      }

      return this.domain.replace(this.$config.public.tldName, '')
    },
  },

  methods: {
    async fetchProfilePicture() {
      if (this.image) {
        const prefetchRes = await getWorkingUrl(this.image)

        if (prefetchRes.success) {
          return this.imgPath = prefetchRes.url
        }
      }
      
      // Check if domain name is passed as a prop
      if (this.domainName) {
        // Check if domain name has an image (domainName-img key)
        const dataObject = fetchData(window, this.domainName, "img", this.$config.public.expiryPfps)

        if (dataObject) {
          const prefetchRes = await getWorkingUrl(dataObject.image)

          if (prefetchRes.success) {
            return this.imgPath = prefetchRes.url
          }
        } else {
          // fetch image from blockchain
          if (this.isConnected && this.chainId === this.$config.public.supportedChainId) {
            try {
              // Read domain data from contract
              const contractConfig = {
                address: this.$config.public.punkTldAddress,
                abi: [
                  {
                    name: 'getDomainData',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: '_domainName', type: 'string' }],
                    outputs: [{ name: '', type: 'string' }]
                  }
                ],
                functionName: 'getDomainData',
                args: [String(this.domainName).toLowerCase()]
              }

              const domainData = await readData(contractConfig)

              if (domainData) {
                const domainDataJson = JSON.parse(domainData)

                if (domainDataJson?.image) {
                  const res = await getWorkingUrl(domainDataJson.image)

                  if (res.success) {
                    this.imgPath = res.url
                    return storeData(window, this.domainName, { image: domainDataJson.image }, "img")
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching domain data:', error)
            }
          }
        }
      }

      // If none of the above, use default image
      return this.imgPath = this.defaultImage
    },
  },

  setup() {
    const config = useConfig()
    const { chainId, isConnected } = useAccount({ config })

    return {
      chainId,
      isConnected,
    }
  },

  watch: {
    domain(oldValue, newValue) {
      if (oldValue != newValue) {
        this.fetchProfilePicture()
      }
    },

    image(oldValue, newValue) {
      if (oldValue != newValue) {
        this.imgPath = "https://placeholder.pics/svg/300/32BBFF/ffffff/loading"
        this.fetchProfilePicture()
      }
    },
  },
}
</script>
