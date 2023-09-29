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
        <button class="btn btn-outline-primary btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#searchModal">
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

    <div class="d-flex justify-content-center mb-3" v-if="waitingData">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>

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

  </div>
</div>

<!-- Search Modal -->
<div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="searchModalLabel">Find NFT collection</h1>
        <button id="closeSearchModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        <div class="mb-3">
          <label for="searchInputField" class="form-label">Enter NFT collection address or unique ID:</label>
          <input v-model="searchText" type="text" class="form-control" id="searchInputField" />
        </div>

        <p v-if="findError">Error: Collection not found...</p>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button @click="findNft" type="button" class="btn btn-primary" :disabled="waitingFind">
          <span v-if="waitingFind" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Find
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { fetchCollection, storeCollection } from '~/utils/storageUtils';

export default {
  name: 'Nft',
  props: ["hideBackButton"],

  data() {
    return {
      featuredNfts: [],
      findError: false,
      lastNfts: [],
      searchText: null,
      waitingData: false,
      waitingFind: false
    }
  },

  mounted() {
    if (this.$config.nftLaunchpadBondingAddress) {
      this.fetchData();
    }
  },

  methods: {
    async fetchData() {
      this.waitingData = true;

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      // create launchpad contract object
      const launchpadInterface = new ethers.utils.Interface([
        "function getFeaturedNftContracts(uint256 amount) external view returns(address[] memory)",
        "function getLastNftContracts(uint256 amount) external view returns(address[] memory)"
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider
      );

      // get featured NFTs
      const fNfts = await launchpadContract.getFeaturedNftContracts(4);

      await this.parseNftsArray(fNfts, this.featuredNfts, provider);

      // get last NFTs
      const lNfts = await launchpadContract.getLastNftContracts(this.$config.nftLaunchpadLatestItems);
      const lNftsWritable = [...lNfts]; // copy the lNfts array to make it writable (for reverse() method)

      // reverse the lNftsWritable array (to show the latest NFTs first)
      lNftsWritable.reverse();

      await this.parseNftsArray(lNftsWritable, this.lastNfts, provider);

      this.waitingData = false;
    },

    async findNft() {
      this.waitingFind = true;
      this.findError = false;

      if (this.searchText) {
        if (String(this.searchText).toLowerCase().startsWith("0x")) {
          document.getElementById("closeSearchModal").click();
          this.$router.push({ path: '/nft/collection/', query: { id: this.searchText } });
          this.searchText = null;
          return this.waitingFind = false;
        } else {
          // search by unique ID
          const launchpadInterface = new ethers.utils.Interface([
            "function getNftContractAddress(string calldata _uniqueId) external view returns(address)"
          ]);

          // fetch provider from hardcoded RPCs
          let provider = this.$getFallbackProvider(this.$config.supportedChainId);

          if (this.isActivated && this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's MetaMask
            provider = this.signer;
          }

          const launchpadContract = new ethers.Contract(
            this.$config.nftLaunchpadBondingAddress,
            launchpadInterface,
            provider
          );

          const nftAddress = await launchpadContract.getNftContractAddress(this.searchText);

          if (nftAddress !== ethers.constants.AddressZero) {
            document.getElementById("closeSearchModal").click();
            this.$router.push({ path: '/nft/collection/', query: { id: nftAddress } });
            this.searchText = null;
            return this.waitingFind = false;
          }
        }

        this.findError = true;

        return this.waitingFind = false;
      }
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
  },
}
</script>