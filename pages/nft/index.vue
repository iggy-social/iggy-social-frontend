<template>
<Head>
  <Title>NFT Launchpad | {{ $config.projectMetadataTitle }}</Title>
  <Meta property="og:title" :content="'NFT Launchpad | ' + $config.projectMetadataTitle" />

  <Meta name="description" :content="'Check out these awesome NFT collections on ' + $config.projectName + '!'" />

  <Meta property="og:image" :content="$config.projectUrl+$config.previewImageNftLaunchpad" />
  <Meta property="og:description" :content="'Check out these awesome NFT collections on ' + $config.projectName + '!'" />

  <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImageNftLaunchpad" />
  <Meta name="twitter:description" :content="'Check out these awesome NFT collections on ' + $config.projectName + '!'" />
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
        Create your NFT and win a 2000 {{ $config.tokenSymbol }} prize! Hurry up, the competition ends on Friday, 29 September!
      </NuxtLink>
    </div>
    -->

    <h4 class="mb-3" v-if="featuredNfts.length > 0">Featured</h4>

    <div class="row" v-if="featuredNfts.length > 0">
      <NuxtLink v-for="nft in featuredNfts" :key="nft.address" class="col-md-3 text-decoration-none" :to="'/nft/collection?id=' + nft.address">
        <div class="card border mb-3">
          <img :src="nft.image" class="card-img-top" :alt="nft.name">
          <div class="card-body rounded-bottom-3">
            <p class="card-text mb-1"><strong>{{ nft.name }}</strong></p>
            <small class="card-text">{{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}</small>
          </div>
        </div>
      </NuxtLink>
    </div>

    <h4 class="mt-3 mb-3" v-if="lastNfts.length > 0">Latest</h4>

    <div class="row">
      <NuxtLink v-for="nft in lastNfts" :key="nft.address" class="col-md-3 text-decoration-none" :to="'/nft/collection?id=' + nft.address">
        <div class="card border mb-3">
          <img :src="nft.image" class="card-img-top" :alt="nft.name">
          <div class="card-body rounded-bottom-3">
            <p class="card-text mb-1"><strong>{{ nft.name }}</strong></p>
            <small class="card-text">{{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}</small>
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
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import SearchNftModal from '~/components/nft/SearchNftModal.vue';
import { fetchCollection, storeCollection } from '~/utils/storageUtils';

export default {
  name: 'Nft',
  props: ["hideBackButton"],

  data() {
    return {
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
      featuredNfts: [],
      lastNfts: [],
      waitingData: false
    }
  },

  components: {
    SearchNftModal
  },

  mounted() {
    if (this.$config.nftLaunchpadBondingAddress) {
      this.fetchFeaturedNfts();
      this.fetchLastNfts();
    }
  },

  computed: {
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0;
    }
  },

  methods: {
    async fetchFeaturedNfts() {
      this.waitingData = true;

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      // create launchpad contract object
      const launchpadInterface = new ethers.utils.Interface([
        "function getFeaturedNftContracts(uint256 amount) external view returns(address[] memory)"
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider
      );

      // get featured NFTs
      const fNfts = await launchpadContract.getFeaturedNftContracts(4);

      await this.parseNftsArray(fNfts, this.featuredNfts, provider);
    },

    async fetchLastNfts() {
      this.waitingData = true;

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      // create launchpad contract object
      const launchpadInterface = new ethers.utils.Interface([
        "function getLastNftContracts(uint256 amount) external view returns(address[] memory)",
        "function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)",
        "function getNftContractsArrayLength() external view returns(uint256)"
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider
      );

      // get all NFTs array length
      if (Number(this.allNftsArrayLength) === 0) {
        this.allNftsArrayLength = await launchpadContract.getNftContractsArrayLength();
      }

      if (Number(this.allNftsArrayLength) === 1) {
        const lNfts = await launchpadContract.getLastNftContracts(1);
        await this.parseNftsArray(lNfts, this.lastNfts, provider);
      } else if (Number(this.allNftsArrayLength) > 1) {
        // set the start and end index, if end index is 0
        if (this.allNftsIndexEnd === 0) {
          this.allNftsIndexEnd = this.allNftsArrayLength - 1;

          if (this.allNftsArrayLength < this.$config.nftLaunchpadLatestItems) {
            this.allNftsIndexStart = 0;
          } else {
            this.allNftsIndexStart = this.allNftsArrayLength - this.$config.nftLaunchpadLatestItems;
          }
        }

        // get last NFTs
        const lNfts = await launchpadContract.getNftContracts(this.allNftsIndexStart, this.allNftsIndexEnd);
        const lNftsWritable = [...lNfts]; // copy the lNfts array to make it writable (for reverse() method)

        // reverse the lNftsWritable array (to show the latest NFTs first)
        lNftsWritable.reverse();

        await this.parseNftsArray(lNftsWritable, this.lastNfts, provider);

        if (this.allNftsIndexEnd > this.$config.nftLaunchpadLatestItems) {
          this.allNftsIndexEnd = this.allNftsIndexEnd - this.$config.nftLaunchpadLatestItems;
        } else {
          this.allNftsIndexEnd = 0;
        }

        if (this.allNftsIndexStart > this.$config.nftLaunchpadLatestItems) {
          this.allNftsIndexStart = this.allNftsIndexStart - this.$config.nftLaunchpadLatestItems;
        } else {
          this.allNftsIndexStart = 0;
        }
      }

      this.waitingData = false;
    },

    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }

      const price = Number(ethers.utils.formatEther(priceWei));

      if (price > 100) {
        return price.toFixed(0);
      } else if (price > 1) {
        return price.toFixed(2);
      } else if (price > 0.1) {
        return price.toFixed(4);
      } else if (price > 0.01) {
        return price.toFixed(5);
      } else if (price > 0.001) {
        return price.toFixed(6);
      } else if (price > 0.0001) {
        return price.toFixed(7);
      } else if (price > 0.00001) {
        return price.toFixed(8);
      } else if (price > 0.000001) {
        return price.toFixed(9);
      } else {
        return price;
      }
    },

    async parseNftsArray(inputArray, outputArray, provider) {
      const nftInterface = new ethers.utils.Interface([
        "function collectionPreview() public view returns (string memory)",
        "function getMintPrice() public view returns (uint256)",
        "function name() public view returns (string memory)"
      ]);

      // for loop to get NFTs data (price, name & image)
      for (let i = 0; i < inputArray.length; i++) {
        const nftContract = new ethers.Contract(inputArray[i], nftInterface, provider);

        // fetch collection object from storage
        let collection = fetchCollection(window, inputArray[i]);
        
        if (!collection) {
          collection = {
            address: inputArray[i]
          };
        }

        // get collection name
        let cName;

        if (collection?.name) {
          cName = collection.name;
        } else {
          cName = await nftContract.name();
          collection["name"] = cName;
        }

        // get price
        const mintPriceWei = await nftContract.getMintPrice();

        // get image
        let cImage;

        if (collection?.image) {
          cImage = collection.image;
        } else {
          cImage = await nftContract.collectionPreview();
          collection["image"] = cImage;
        }

        // check if collection image uses Spheron IPFS gateway (in that case replace it with the IPFS gateway defined in the config)
        if (collection.image.includes(".ipfs.sphn.link/")) {
          const linkParts = collection.image.split(".ipfs.sphn.link/");
          const cid = linkParts[0].replace("https://", "");
          const newImageLink = this.$config.ipfsGateway + cid + "/" + linkParts[1];
          collection["image"] = newImageLink;
          cImage = newImageLink;
        }

        // store collection object in storage
        storeCollection(window, inputArray[i], collection);

        outputArray.push({
          address: inputArray[i],
          image: cImage,
          name: cName,
          price: mintPriceWei
        });
      }
    }
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();

    return { address, chainId, isActivated, signer }
  }
}
</script>