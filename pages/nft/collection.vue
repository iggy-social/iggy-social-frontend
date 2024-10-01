<template>
  <Head>
    <Title>NFT Collection Details | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'NFT Collection Details | ' + $config.projectMetadataTitle" />

    <Meta name="description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />

    <Meta property="og:image" :content="$config.projectUrl + $config.previewImageNftCollection" />
    <Meta property="og:description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.projectUrl + $config.previewImageNftCollection" />
    <Meta name="twitter:description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3">
        <i @click="$router.push({ path: '/nft' })" class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3" v-if="!cName">NFT Collection Details</h3>
      <h3 class="mb-3 mt-3" v-if="cName">{{ cName }}</h3>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <div class="row">
        <div class="col-md-5 text-center mb-3">
          <Image
            v-if="cImage"
            :url="cImage"
            :cls="'img-fluid img-thumbnail rounded col-12'"
            :alt="cName"
            :key="cImage"
          />

          <!-- Actions dropdown -->
          <div class="dropdown mt-3" v-if="nativeNft">
            <button
              class="btn btn-outline-primary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Actions
            </button>
            <ul class="dropdown-menu">
              <li v-if="isCurrentAddressOwner">
                <span
                  class="dropdown-item cursor-pointer"
                  data-bs-toggle="modal"
                  data-bs-target="#changeDescriptionModal"
                >
                  Change description
                </span>
              </li>

              <li v-if="isCurrentAddressOwner">
                <span
                  class="dropdown-item cursor-pointer"
                  data-bs-toggle="modal"
                  data-bs-target="#changeCollectionPreviewModal"
                >
                  Change collection preview image
                </span>
              </li>

              <li v-if="isCurrentAddressOwner && cType == 0">
                <span
                  class="dropdown-item cursor-pointer"
                  data-bs-toggle="modal"
                  data-bs-target="#addImageToCollectionModal"
                >
                  Add additional image to collection
                </span>
              </li>

              <li v-if="isCurrentAddressOwner && cType == 0">
                <span
                  class="dropdown-item cursor-pointer"
                  data-bs-toggle="modal"
                  data-bs-target="#removeImageFromCollectionModal"
                >
                  Remove image from collection
                </span>
              </li>

              <li v-if="isCurrentAddressOwner">
                <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#changeNftTypeModal">
                  Change collection type
                </span>
              </li>

              <li v-if="address">
                <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#sendNftModal">
                  Send your NFT to another address
                </span>
              </li>

              <li>
                <span class="dropdown-item cursor-pointer" @click="getCollectionDetails(true)">Refresh metadata</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-7">
          <!--
					<h3 class="mb-3">Collection: {{ cName }}</h3>
					-->

          <!-- Data -->
          <div class="mt-1 mb-4 muted-text" style="font-size: 14px">
            <p class="me-4">
              <i class="bi bi-file-earmark-text-fill me-1"></i>
              {{ cDescription }}
            </p>

            <p class="me-4" v-if="nativeNft">
              <i class="bi bi-coin me-1"></i>
              Buy/Sell price: {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }} /
              {{ formatPrice(priceSellWei) }} {{ $config.tokenSymbol }}
            </p>

            <p class="me-4">
              <i class="bi bi-file-earmark-binary me-1"></i>
              {{ cSupply }} NFTs minted
            </p>

            <p class="me-4">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a
                :href="$config.blockExplorerBaseUrl + '/address/' + cAddress"
                target="_blank"
                style="text-decoration: none"
              >
                {{ shortenAddress(cAddress) }}
              </a>
              <span v-if="getUsernameOrShortAddress">
                by
                <NuxtLink :to="'/profile/?id=' + String(getUsernameOrFullAddress)">{{
                  getUsernameOrShortAddress
                }}</NuxtLink>
              </span>
            </p>

            <!--
            <p class="me-4">
              <i class="bi bi-box-arrow-up-right me-1"></i>
              <a
                :href="$config.marketplaceNftCollectionBaseUrl + cAddress"
                target="_blank"
                style="text-decoration: none"
              >
                See on NFT marketplace
              </a>
            </p>
            -->

            <div v-if="cAddress" class="dropdown">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <span class="dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                <span>See all NFTs in the collection</span>
              </span>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item cursor-pointer" target="_blank" :href="collectionMarketplaceLink">
                  <i class="bi bi-box-arrow-up-right me-1"></i>
                  See NFTs on NFT marketplace
                </a>
                <a class="dropdown-item cursor-pointer" target="_blank" :href="collectionExplorerLink">
                  <i class="bi bi-box-arrow-up-right me-1"></i>
                  See NFTs on block explorer
                </a>
              </div>
            </div>
            
          </div>
          <!-- END Data -->

          <!-- Buttons -->
          <div class="row mb-3" v-if="nativeNft">
            <div v-if="!isActivated || !isSupportedChain" class="d-grid gap-2 col">
              <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
              <SwitchChainButton v-if="isActivated && !isSupportedChain" />
            </div>

            <div v-if="isActivated && isSupportedChain" class="d-grid gap-2 col">
              <button @click="buyNft" class="btn btn-primary" type="button" :disabled="waitingData || waitingBuy">
                <span
                  v-if="waitingBuy"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Buy for {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }}
              </button>
            </div>

            <div v-if="isActivated && isSupportedChain" class="d-grid gap-2 col">
              <button
                @click="sellNft"
                class="btn btn-primary"
                type="button"
                :disabled="waitingData || waitingSell || !userTokenId || priceSellWei == 0"
              >
                <span
                  v-if="waitingSell"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Sell for {{ formatPrice(priceSellWei) }} {{ $config.tokenSymbol }}
              </button>
            </div>
          </div>

          <small v-if="isActivated && isSupportedChain && nativeNft">
            <em>
              (Price may still change after pressing the button, so make sure to check the
              {{ $config.tokenSymbol }} amount in wallet.)
            </em>
          </small>
          <!-- END Buttons -->
        </div>
      </div>
    </div>
  </div>

  <!-- Alert to buy an NFT to chat -->
  <div v-if="!userTokenId && nativeNft" class="card border mt-3 scroll-500">
    <div class="card-body">
      <h5 class="mb-2 mt-3 text-center">Buy an NFT to see the chat</h5>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">
          <p class="text-break text-center mt-3 mb-4">
            This NFT's chat is open only for NFT holders. Buy an NFT to see the chat and talk with the NFT creator and
            other NFT holders.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div :key="userTokenId" v-if="userTokenId || isCurrentAddressOwner">
    <!-- Media section -->
    <CollectionMediaSection  
      v-if="audioUrl || videoUrl || youtubeUrl" 
      :audioUrl="audioUrl" :videoUrl="videoUrl" :youtubeUrl="youtubeUrl" 
    />

    <!-- Chat feed -->
    <ChatFeed
      :hideCommentBox="false"
      class="mt-3 scroll-500"
      :chatContext="$config.chat.contexts.nftLaunchpad"
      :mainItemId="cAddress"
    />
    
  </div>

  <!-- Add image modal -->
  <AddImageToCollectionModal :cAddress="cAddress" :mdAddress="mdAddress" />

  <!-- Change collection preview image modal -->
  <ChangeCollectionPreviewModal :cAddress="cAddress" :mdAddress="mdAddress" @saveCollection="saveCollection" />

  <!-- Change description modal -->
  <ChangeDescriptionModal
    :cAddress="cAddress"
    :cDescription="cDescription"
    :mdAddress="mdAddress"
    @saveCollection="saveCollection"
  />

  <!-- Change Metadata URL Modal -->
  <ChangeNftTypeModal :mdAddress="mdAddress" :cType="cType" :cAddress="cAddress" @saveCollection="saveCollection" />

  <!-- Remove Image From Collection Modal -->
  <RemoveImageFromCollectionModal :mdAddress="mdAddress" :cAddress="cAddress" />

  <!-- Send NFT Modal -->
  <SendNftModal v-if="address" :address="address" :cAddress="cAddress" :signer="signer" />
</template>

<script>
import { ethers } from 'ethers'
import { useEthers, shortenAddress } from '~/store/ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import ChatFeed from '~/components/chat/ChatFeed.vue'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import Image from '~/components/Image.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import AddImageToCollectionModal from '~/components/nft/collection/AddImageToCollectionModal'
import ChangeCollectionPreviewModal from '~/components/nft/collection/ChangeCollectionPreviewModal'
import ChangeDescriptionModal from '~/components/nft/collection/ChangeDescriptionModal'
import ChangeNftTypeModal from '~/components/nft/collection/ChangeNftTypeModal'
import CollectionMediaSection from '~/components/nft/collection/CollectionMediaSection.vue';
import RemoveImageFromCollectionModal from '~/components/nft/collection/RemoveImageFromCollectionModal'
import SendNftModal from '~/components/nft/collection/SendNftModal.vue';
import { getDomainName } from '~/utils/domainUtils'
import { getIpfsUrl } from '~/utils/ipfsUtils'
import { fetchCollection, fetchUsername, storeCollection, storeUsername } from '~/utils/storageUtils'
import { getTextWithoutBlankCharacters } from '~/utils/textUtils'

export default {
  name: 'NftCollection',

  data() {
    return {
      audioUrl: null,
      cAuthorAddress: null,
      cAuthorDomain: null,
      cDescription: null,
      cImage: null,
      cName: null,
      cSupply: null,
      cType: 0,
      mdAddress: null,
      mediaMetadataContract: false,
      nativeNft: true, // if true, it means that the NFT is native to this launchpad
      priceBuyWei: null,
      priceSellWei: null,
      userTokenId: null, // if user owns at least one NFT, this will be set to the first token ID that user owns
      videoUrl: null,
      waitingBuy: false,
      waitingData: false,
      waitingMedia: false,
      waitingSell: false,
      youtubeUrl: null,
    }
  },

  components: {
    AddImageToCollectionModal,
    ChangeCollectionPreviewModal,
    ChangeDescriptionModal,
    ChangeNftTypeModal,
    ChatFeed,
    CollectionMediaSection,
    ConnectWalletButton,
    Image,
    RemoveImageFromCollectionModal,
    SendNftModal,
    SwitchChainButton,
    WaitingToast,
  },

  mounted() {
    if (this.cAddress) {
      // check if address is valid
      if (!ethers.utils.isAddress(this.cAddress)) {
        this.toast('Invalid NFT address.', { type: 'error' })
        return this.$router.push({ path: '/' })
      }

      this.getCollectionDetails()
    }
  },

  computed: {
    cAddress() {
      if (this.$route.query?.id) {
        return this.$route.query.id
      }

      return null
    },

    collectionExplorerLink() {
      return this.$config.blockExplorerBaseUrl+"/token/"+this.cAddress;
    },

    collectionMarketplaceLink() {
      return this.$config.marketplaceNftCollectionBaseUrl + this.cAddress
    },

    getUsernameOrFullAddress() {
      if (this.cAuthorDomain) {
        let cleanName = String(this.cAuthorDomain).replace(this.$config.tldName, '')
        return getTextWithoutBlankCharacters(cleanName) + this.$config.tldName
      } else {
        return this.cAuthorAddress
      }
    },

    getUsernameOrShortAddress() {
      if (this.cAuthorAddress) {
        if (this.cAuthorDomain) {
          let cleanName = String(this.cAuthorDomain).replace(this.$config.tldName, '')
          return getTextWithoutBlankCharacters(cleanName) + this.$config.tldName
        } else {
          return shortenAddress(this.cAuthorAddress)
        }
      }

      return null
    },

    isCurrentAddressOwner() {
      if (this.cAuthorAddress && this.address) {
        return String(this.cAuthorAddress).toLowerCase() === String(this.address).toLowerCase()
      }

      return false
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },

  },

  methods: {
    getDomainName,

    async buyNft() {
      this.waitingBuy = true

      const nftInterface = new ethers.utils.Interface([
        'function getBurnPrice() public view returns (uint256)',
        'function getMintPrice() public view returns (uint256)',
        'function mint(address to) external payable returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
        'function totalSupply() public view returns (uint256)',
      ])

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer)

      // fetch the price again to get the latest price
      this.priceBuyWei = await nftContract.getMintPrice()

      try {
        const tx = await nftContract.mint(this.address, {
          value: this.priceBuyWei,
        })

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          },
        )

        const receipt = await tx.wait()

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait)

          this.toast('You have successfully bought the NFT! Congrats!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.priceBuyWei = await nftContract.getMintPrice()
          this.priceSellWei = await nftContract.getBurnPrice()

          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0)
          } catch (e) {
            this.userTokenId = null
          }

          this.cSupply = await nftContract.totalSupply()

          this.waitingBuy = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingBuy = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('reason=')[1]
          extractMessage = extractMessage.split(', method=')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingBuy = false
      }
    },

    async fetchUserDomain() {
      if (this.cAuthorAddress) {
        const provider = this.$getFallbackProvider(this.$config.supportedChainId)
        const userDomain = await this.getDomainName(this.cAuthorAddress, provider)

        if (userDomain) {
          this.cAuthorDomain = userDomain
          storeUsername(window, this.cAuthorAddress, userDomain + this.$config.tldName)
        }
      }
    },

    formatPrice(priceWei) {
      if (priceWei === null) {
        return null
      }

      const price = Number(ethers.utils.formatEther(priceWei))

      if (price > 100) {
        return price.toFixed(0)
      } else if (price > 1) {
        return price.toFixed(2)
      } else if (price > 0.1) {
        return price.toFixed(4)
      } else if (price > 0.01) {
        return price.toFixed(5)
      } else if (price > 0.001) {
        return price.toFixed(6)
      } else if (price > 0.0001) {
        return price.toFixed(7)
      } else if (price > 0.00001) {
        return price.toFixed(8)
      } else if (price > 0.000001) {
        return price.toFixed(9)
      } else {
        return price
      }
    },

    async getCollectionDetails(refresh = false) {
      this.waitingData = true

      let collection = fetchCollection(window, this.cAddress)

      if (refresh) {
        console.log('Refreshing collection metadata...')
        collection = null
      }

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const nftInterface = new ethers.utils.Interface([
        'function getBurnPrice() public view returns (uint256)',
        'function getMintPrice() public view returns (uint256)',
        'function metadataAddress() public view returns (address)',
        'function name() public view returns (string memory)',
        'function owner() public view returns (address)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
        'function totalSupply() public view returns (uint256)',
      ])

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, provider)

      console.log("Fetching collection details...");

      if (collection?.mdAddress) {
        this.mdAddress = collection.mdAddress;
      } else {
        try {
          this.mdAddress = await nftContract.metadataAddress();
        } catch (e) {
          return this.getCollectionDetailsFallback();
        }
      }

      const metadataInterface = new ethers.utils.Interface([
        "function getCollectionDescription(address) public view returns (string memory)",
        "function getCollectionMetadataType(address nftAddress_) external view returns (uint256)",
        "function getCollectionName(address nftAddress_) external view returns (string memory)",
        "function getCollectionPreviewImage(address) public view returns (string memory)",
        "function getMetadata(address nftAddress_, uint256 tokenId_) external view returns (string memory)",
        "function mdContractType() external view returns (string memory)"
      ]);

      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, provider)

      // get collection details
      try {
        this.priceBuyWei = await nftContract.getMintPrice()
        this.priceSellWei = await nftContract.getBurnPrice()
      } catch (e) {
        return this.getCollectionDetailsFallback();
      }

      // get image
      if (collection?.image) {
        this.cImage = collection.image
      } else {
        this.cImage = await metadataContract.getCollectionPreviewImage(this.cAddress)
      }

      // get IPFS link
      const imageIpfsUrl = getIpfsUrl(this.cImage)

      if (imageIpfsUrl) {
        this.cImage = imageIpfsUrl
      }

      // get description
      if (collection?.description && collection.description !== '' && collection.description !== null) {
        this.cDescription = collection.description
      } else {
        this.cDescription = await metadataContract.getCollectionDescription(this.cAddress)
      }

      // get type
      if (collection?.type >= 0) {
        this.cType = collection.type
      } else {
        this.cType = Number(await metadataContract.getCollectionMetadataType(this.cAddress))
      }

      // get name
      if (collection?.name) {
        this.cName = collection.name
      } else {
        this.cName = await nftContract.name()
      }

      try {
        this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0)
      } catch (e) {
        this.userTokenId = null
      }

      this.waitingData = false

      this.cSupply = await nftContract.totalSupply()

      // get author address
      if (collection?.authorAddress) {
        this.cAuthorAddress = collection.authorAddress
        this.cAuthorDomain = collection.authorDomain
      } else {
        this.cAuthorAddress = await nftContract.owner()
      }

      // get username from storage
      this.cAuthorDomain = fetchUsername(window, this.cAuthorAddress)

      if (!this.cAuthorDomain) {
        this.fetchUserDomain()
      }

      // create collection object, JSON.stringify it and save it to session storage
      collection = {
        address: this.cAddress,
        authorAddress: this.cAuthorAddress,
        authorDomain: this.cAuthorDomain,
        description: this.cDescription,
        image: this.cImage,
        mdAddress: this.mdAddress,
        name: this.cName,
        type: this.cType,
      }

      storeCollection(window, this.cAddress, collection)

      this.waitingMedia = true;

      // getMetadata
      let mdTokenId = this.userTokenId ? this.userTokenId : 1;
      let metadata = await metadataContract.getMetadata(this.cAddress, mdTokenId);

      if (String(metadata).startsWith("http")) {
        metadata = getIpfsUrl(metadata);
      }

      // if metadata starts with "ipfs://" convert it into default IPFS gateway link
      if (String(metadata).startsWith("ipfs://")) {
        metadata = String(metadata).replace("ipfs://", this.$config.ipfsGateway);
      }

      // if it starts with http, fetch data with axios
      if (String(metadata).startsWith("http")) {
        try {
          const response = await axios.get(metadata);
          metadata = response.data;
        } catch (e) {
          console.error(e);

          if (metadata.startsWith(this.$config.ipfsGateway)) {
            try {
              metadata = String(metadata).replace(this.$config.ipfsGateway, this.$config.ipfsGateway2);
              const response = await axios.get(metadata);
              metadata = response.data;
            } catch (e) {
              console.error(e);
              return
            }
          }
        }
      } else {
        // if not, it's very likely base64 encoded string, so decode it
        metadata = atob(String(metadata).replace("data:application/json;base64,", ""));
      }

      // if metadata type is not object, convert it to a JSON object
      if (typeof metadata !== "object" && typeof metadata == "string") {
        metadata = JSON.parse(metadata);
      }

      // check if this metadata has media (audio_url, video_url, youtube_url)
      if (metadata?.audio_url) {
        this.audioUrl = metadata.audio_url;
      }

      if (metadata?.animation_url) {
        this.videoUrl = metadata.animation_url;
      }

      if (metadata?.youtube_url) {
        this.youtubeUrl = metadata.youtube_url;
      }

      this.waitingMedia = false;

      if (this.cType == 0 && this.isCurrentAddressOwner) { // type 0 means onchain metadata
        // check if metadata contract has mdContractType variable and if it's set to "media"
        try {
          const mdContractType = await metadataContract.mdContractType();

          if (mdContractType == "media") {
            this.mediaMetadataContract = true;
          }
        } catch (e) {
          console.log("Not media metadata contract.");
        }
      }
    },

    async getCollectionDetailsFallback() {
      console.log("Fetching collection details via fallback method...");

      // this function is called if the NFT contract was not created via NFTdegen
      this.nativeNft = false;

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      const nftInterface = new ethers.utils.Interface([
        "function name() public view returns (string memory)",
        "function owner() public view returns (address)",
        "function tokenURI(uint256 tokenId) public view returns (string memory)", // ERC-721
        "function totalSupply() public view returns (uint256)",
        "function uri(uint256 tokenId) public view returns (string memory)", // ERC-1155
      ]);

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, provider);

      // fetch name
      this.cName = await nftContract.name();

      let tokenURI;

      try { // ERC-721
        tokenURI = await nftContract.tokenURI(1);
      } catch (e) { // ERC-1155
        tokenURI = await nftContract.uri(1);
      }

      if (tokenURI.startsWith("data:application/json;")) {
        const metadata = JSON.parse(atob(tokenURI.replace("data:application/json;base64,", "")));
        
        if (!this.cName && metadata?.name) {
          this.cName = metadata.name.replace("#1", "");
        }

        if (metadata?.description) {
          this.cDescription = metadata.description;
        }

        if (metadata?.image) {
          this.cImage = metadata.image;
        }

        if (metadata?.external_url) {
          this.cExternalUrl = metadata.external_url;
        }

        if (metadata?.audio_url) {
          this.audioUrl = metadata.audio_url;
        }

        if (metadata?.animation_url) {
          this.videoUrl = metadata.animation_url;
        }

        if (metadata?.youtube_url) {
          this.youtubeUrl = metadata.youtube_url;
        }
      } else {
        // if tokenURI is a URL, fetch it
        try {
          const response = await axios.get(tokenURI);

          const metadata = response.data;

          if (!this.cName && metadata?.name) {
            this.cName = metadata.name.replace("#1", "");
          }

          if (metadata?.description) {
            this.cDescription = metadata.description;
          }

          if (metadata?.image) {
            this.cImage = metadata.image;
          }

          if (metadata?.external_url) {
            this.cExternalUrl = metadata.external_url;
          }

          if (metadata?.audio_url) {
            this.audioUrl = metadata.audio_url;
          }

          if (metadata?.animation_url) {
            this.videoUrl = metadata.animation_url;
          }

          if (metadata?.youtube_url) {
            this.youtubeUrl = metadata.youtube_url;
          }

          
        } catch (e) {
          console.error(e);
        }
      }

      // try-catch for totalSupply
      try {
        this.cSupply = await nftContract.totalSupply();
      } catch (e) {
        console.log("No totalSupply function in the contract.");
      }

      // try-catch for owner
      try {
        this.cAuthorAddress = await nftContract.owner();
        this.cAuthorDomain = fetchUsername(window, this.cAuthorAddress)

        if (!this.cAuthorDomain) {
          this.fetchUserDomain()
        }
      } catch (e) {
        console.log("No owner variable in the contract.");
      }

      this.waitingData = false;
    },

    saveCollection(newCollectionData) {
      if (newCollectionData?.type) {
        this.cType = newCollectionData.type
      }

      if (newCollectionData?.description) {
        this.cDescription = newCollectionData.description
      }

      if (newCollectionData?.image) {
        this.cImage = newCollectionData.image
      }

      // create collection object, JSON.stringify it and save it to session storage
      const collection = {
        address: this.cAddress,
        authorAddress: this.cAuthorAddress,
        authorDomain: this.cAuthorDomain,
        description: this.cDescription,
        image: this.cImage,
        mdAddress: this.mdAddress,
        name: this.cName,
        type: this.cType,
      }

      storeCollection(window, this.cAddress, collection)
    },

    async sellNft() {
      this.waitingSell = true

      const nftInterface = new ethers.utils.Interface([
        'function getBurnPrice() public view returns (uint256)',
        'function getMintPrice() public view returns (uint256)',
        'function burn(uint256 tokenId) external returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
        'function totalSupply() public view returns (uint256)',
      ])

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer)

      try {
        const tx = await nftContract.burn(this.userTokenId)

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          },
        )

        const receipt = await tx.wait()

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait)

          this.toast('You have dumped the NFT.', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.priceBuyWei = await nftContract.getMintPrice()
          this.priceSellWei = await nftContract.getBurnPrice()

          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0)
          } catch (e) {
            this.userTokenId = null
          }

          this.cSupply = await nftContract.totalSupply()

          this.waitingSell = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingSell = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('reason=')[1]
          extractMessage = extractMessage.split(', method=')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingSell = false
      }
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast()

    return { address, chainId, isActivated, shortenAddress, signer, toast }
  },

  watch: {
    address(newValue, oldValue) {
      if (oldValue && oldValue !== newValue && !this.waitingData) {
        this.getCollectionDetails()
      }
    },

    chainId(newValue, oldValue) {
      if (newValue == this.$config.supportedChainId && oldValue !== newValue && !this.waitingData) {
        this.getCollectionDetails()
      }
    },

    cAddress(newValue, oldValue) {
      // if cAddress and also if path is /nft/collection?id=...
      if (newValue && oldValue && newValue !== oldValue && this.cAddress && this.$route.path === '/nft/collection') {
        // check if address is valid
        if (!ethers.utils.isAddress(this.cAddress)) {
          this.toast('Invalid NFT address.', { type: 'error' })
          return this.$router.push({ path: '/' })
        }

        this.getCollectionDetails()
      }
    },
  },
}
</script>
