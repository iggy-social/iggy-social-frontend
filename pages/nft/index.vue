<template>
  <Head>
    <Title>NFT Launchpad | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'NFT Launchpad | ' + $config.public.projectMetadataTitle" />

    <Meta name="description" :content="'Check out these awesome NFT collections on ' + $config.public.projectName + '!'" />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageNftLaunchpad" />
    <Meta
      property="og:description"
      :content="'Check out these awesome NFT collections on ' + $config.public.projectName + '!'"
    />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageNftLaunchpad" />
    <Meta
      name="twitter:description"
      :content="'Check out these awesome NFT collections on ' + $config.public.projectName + '!'"
    />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p v-if="!hideBackButton" class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="d-flex flex-row flex-wrap mt-3">
        <div class="mb-3 me-auto">NFT Launchpad</div>

        <div class="mb-3">
          <NuxtLink class="btn btn-outline-primary btn-sm" to="/nft/create">
            <i class="bi bi-plus-circle"></i> Create
          </NuxtLink>
          <button class="btn btn-outline-primary btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#searchNftModal">
            <i class="bi bi-search"></i> Find
          </button>
        </div>
      </h3>

      <!-- NFT competition alert 
    <div class="alert alert-primary mb-3 text-center" role="alert">
      <NuxtLink to="/post/?id=kjzl6cwe1jw149z0ddpcygc1nhgjdppg1zpr8r4s0j8siaq0bod6u0v5dyaqr2c">
        Create your NFT and win a 2000 {{ $config.public.tokenSymbol }} prize! Hurry up, the competition ends on Friday, 29 September!
      </NuxtLink>
    </div>
    -->

      <h4 class="mb-3" v-if="featuredNfts.length > 0">Featured</h4>

      <div class="row" v-if="featuredNfts.length > 0">
        <NuxtLink
          v-for="nft in featuredNfts"
          :key="nft.address"
          class="col-md-3 text-decoration-none"
          :to="'/nft/collection?id=' + nft.address"
        >
          <div class="card border mb-3">
            <Image :url="nft.image" :alt="nft.name" cls="card-img-top" />
            <div class="card-body rounded-bottom-3">
              <p class="card-text mb-1">
                <strong>{{ nft.name }}</strong>
              </p>
              <small class="card-text">{{ formatPrice(nft.price) }} {{ $config.public.tokenSymbol }}</small>
            </div>
          </div>
        </NuxtLink>
      </div>

      <h4 class="mt-3 mb-3" v-if="lastNfts.length > 0">Latest</h4>

      <div class="row">
        <NuxtLink
          v-for="nft in lastNfts"
          :key="nft.address"
          class="col-md-3 text-decoration-none"
          :to="'/nft/collection?id=' + nft.address"
        >
          <div class="card border mb-3">
            <Image :url="nft.image" :alt="nft.name" cls="card-img-top" />
            <div class="card-body rounded-bottom-3">
              <p class="card-text mb-1">
                <strong>{{ nft.name }}</strong>
              </p>
              <small class="card-text">{{ formatPrice(nft.price) }} {{ $config.public.tokenSymbol }}</small>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <div v-if="showLoadMoreButton" class="d-grid gap-2">
        <button class="btn btn-primary" @click="fetchLastNfts" :disabled="waitingData">
          <span v-if="waitingData" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Load more
        </button>
      </div>
    </div>
  </div>

  <!-- Search Modal -->
  <SearchNftModal />
</template>

<script>
import { formatEther } from 'viem'

import Image from '@/components/Image.vue'
import SearchNftModal from '@/components/nft/SearchNftModal.vue'

import { fetchCollection, storeCollection } from '@/utils/browserStorageUtils'
import { readData } from '@/utils/contractUtils';
import { getWorkingUrl } from '@/utils/fileUtils'
import { getLessDecimals } from '@/utils/numberUtils';

export default {
  name: 'Nft',
  props: ['hideBackButton'],

  data() {
    return {
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
      featuredNfts: [],
      lastNfts: [],
      waitingData: false,
    }
  },

  components: {
    Image,
    SearchNftModal,
  },

  mounted() {
    if (this.$config.public.nftLaunchpadBondingAddress) {
      this.fetchFeaturedNfts()
      this.fetchLastNfts()
    }
  },

  computed: {
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0
    },
  },

  methods: {
    async fetchFeaturedNfts() {
      this.waitingData = true

      try {
        // create launchpad contract config for readData
        const launchpadContractConfig = {
          address: this.$config.public.nftLaunchpadBondingAddress,
          abi: [
            {
              name: 'getFeaturedNftContracts',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'amount', type: 'uint256' }],
              outputs: [{ name: '', type: 'address[]' }]
            }
          ],
          functionName: 'getFeaturedNftContracts',
          args: [BigInt(4)]
        }

        // get featured NFTs using readData
        const fNfts = await readData(launchpadContractConfig)
        
        if (fNfts) {
          await this.parseNftsArray(fNfts, this.featuredNfts)
        }
      } catch (error) {
        console.error('Error fetching featured NFTs:', error)
      } finally {
        this.waitingData = false
      }
    },

    async fetchLastNfts() {
      this.waitingData = true

      try {
        // create launchpad contract config for readData
        const launchpadContractConfig = {
          address: this.$config.public.nftLaunchpadBondingAddress,
          abi: [
            {
              name: 'getLastNftContracts',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'amount', type: 'uint256' }],
              outputs: [{ name: '', type: 'address[]' }]
            },
            {
              name: 'getNftContracts',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { name: 'fromIndex', type: 'uint256' },
                { name: 'toIndex', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'address[]' }]
            },
            {
              name: 'getNftContractsArrayLength',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ]
        }

        // get all NFTs array length
        if (Number(this.allNftsArrayLength) === 0) {
          const lengthConfig = {
            ...launchpadContractConfig,
            functionName: 'getNftContractsArrayLength',
            args: []
          }
          const lengthResult = await readData(lengthConfig)
          this.allNftsArrayLength = lengthResult ? Number(lengthResult) : 0
        }

        if (this.allNftsArrayLength === 1) {
          const lastNftsConfig = {
            ...launchpadContractConfig,
            functionName: 'getLastNftContracts',
            args: [BigInt(1)]
          }
          const lNfts = await readData(lastNftsConfig)
          if (lNfts) {
            await this.parseNftsArray(lNfts)
          }
        } else if (this.allNftsArrayLength > 1) {
          // set the start and end index, if end index is 0
          if (this.allNftsIndexEnd === 0) {
            this.allNftsIndexEnd = this.allNftsArrayLength - 1

            if (this.allNftsArrayLength < this.$config.public.nftLaunchpadLatestItems) {
              this.allNftsIndexStart = 0
            } else {
              this.allNftsIndexStart = this.allNftsArrayLength - this.$config.public.nftLaunchpadLatestItems
            }
          }

          // get last NFTs
          const contractsConfig = {
            ...launchpadContractConfig,
            functionName: 'getNftContracts',
            args: [BigInt(this.allNftsIndexStart), BigInt(this.allNftsIndexEnd)]
          }
          const lNfts = await readData(contractsConfig)
          
          if (lNfts) {
            const lNftsWritable = [...lNfts] // copy the lNfts array to make it writable (for reverse() method)

            // reverse the lNftsWritable array (to show the latest NFTs first)
            lNftsWritable.reverse()

            await this.parseNftsArray(lNftsWritable)

            if (this.allNftsIndexEnd > this.$config.public.nftLaunchpadLatestItems) {
              this.allNftsIndexEnd = Math.max(0, this.allNftsIndexEnd - this.$config.public.nftLaunchpadLatestItems)
            } else {
              this.allNftsIndexEnd = 0
            }

            if (this.allNftsIndexStart > this.$config.public.nftLaunchpadLatestItems) {
              this.allNftsIndexStart = Math.max(0, this.allNftsIndexStart - this.$config.public.nftLaunchpadLatestItems)
            } else {
              this.allNftsIndexStart = 0
            }
          }
        }
      } catch (error) {
        console.error('Error fetching last NFTs:', error)
      } finally {
        this.waitingData = false
      }
    },

    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }

      const price = Number(formatEther(priceWei));
      return getLessDecimals(price);
    },

    async parseNftsArray(inputArray, outputArray = this.lastNfts) {
      // Clear the output array before adding new items
      //outputArray.length = 0
      
      const nftContractConfig = {
        abi: [
          {
            name: 'collectionPreview',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'string' }]
          },
          {
            name: 'getMintPrice',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }]
          },
          {
            name: 'name',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'string' }]
          }
        ]
      }

      // for loop to get NFTs data (price, name & image)
      for (let i = 0; i < inputArray.length; i++) {
        try {
          // fetch collection object from storage
          let collection = fetchCollection(window, inputArray[i])

          if (!collection) {
            collection = {
              address: inputArray[i],
            }
          }

          // get collection name
          let cName

          if (collection?.name) {
            cName = collection.name
          } else {
            const nameConfig = {
              ...nftContractConfig,
              address: inputArray[i],
              functionName: 'name',
              args: []
            }
            cName = await readData(nameConfig)
            if (cName) {
              collection['name'] = cName
            }
          }

          // get price
          const priceConfig = {
            ...nftContractConfig,
            address: inputArray[i],
            functionName: 'getMintPrice',
            args: []
          }
          const mintPriceWei = await readData(priceConfig)

          // get image
          let cImage

          if (collection?.image) {
            cImage = collection.image
          } else {
            const imageConfig = {
              ...nftContractConfig,
              address: inputArray[i],
              functionName: 'collectionPreview',
              args: []
            }

            cImage = await readData(imageConfig)

            if (cImage) {
              let cImageResult = await getWorkingUrl(cImage)
              if (cImageResult?.success) {
                collection['image'] = cImageResult?.url
              }
            }
          }

          // store collection object in storage
          storeCollection(window, inputArray[i], collection)

          outputArray.push({
            address: inputArray[i],
            image: cImage,
            name: cName,
            price: mintPriceWei,
          })
        } catch (error) {
          console.error(`Error parsing NFT ${inputArray[i]}:`, error)
        }
      }
    },
  },
}
</script>
