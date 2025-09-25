<template>
  <Head>
    <Title>NFT Collection Details | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'NFT Collection Details | ' + $config.public.projectMetadataTitle" />

    <Meta name="description" :content="'Check this NFT collection on ' + $config.public.projectName + '!'" />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageNftCollection" />
    <Meta property="og:description" :content="'Check this NFT collection on ' + $config.public.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageNftCollection" />
    <Meta name="twitter:description" :content="'Check this NFT collection on ' + $config.public.projectName + '!'" />
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
          <!-- Data -->
          <div class="mt-1 mb-4 muted-text" style="font-size: 14px">
            <p class="me-4">
              <i class="bi bi-file-earmark-text-fill me-1"></i>
              {{ cDescription }}
            </p>

            <p class="me-4" v-if="nativeNft">
              <i class="bi bi-coin me-1"></i>
              Buy/Sell price: {{ formatPrice(priceBuyWei) }} {{ $config.public.tokenSymbol }} /
              {{ formatPrice(priceSellWei) }} {{ $config.public.tokenSymbol }}
            </p>

            <p class="me-4">
              <i class="bi bi-file-earmark-binary me-1"></i>
              {{ cSupply }} NFTs minted
            </p>

            <p class="me-4">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a
                :href="$config.public.blockExplorerBaseUrl + '/address/' + cAddress"
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
            <div v-if="!isConnected || !isSupportedChain" class="d-grid gap-2 col">
              <ConnectWalletButton v-if="!isConnected" class="btn-primary" btnText="Connect wallet" />
              <SwitchChainButton v-if="isConnected && !isSupportedChain" />
            </div>

            <div v-if="isConnected && isSupportedChain" class="d-grid gap-2 col">
              <button @click="buyNft" class="btn btn-primary" type="button" :disabled="waitingData || waitingBuy">
                <span
                  v-if="waitingBuy"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Buy for {{ formatPrice(priceBuyWei) }} {{ $config.public.tokenSymbol }}
              </button>
            </div>

            <div v-if="isConnected && isSupportedChain" class="d-grid gap-2 col">
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
                Sell for {{ formatPrice(priceSellWei) }} {{ $config.public.tokenSymbol }}
              </button>
            </div>
          </div>

          <small v-if="isConnected && isSupportedChain && nativeNft">
            <em>
              (Price may still change after pressing the button, so make sure to check the
              {{ $config.public.tokenSymbol }} amount in wallet.)
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

  <div v-if="userTokenId || isCurrentAddressOwner" :key="userTokenId">
    <!-- Media section -->
    <CollectionMediaSection  
      v-if="audioUrl || videoUrl || youtubeUrl" 
      :audioUrl="audioUrl" :videoUrl="videoUrl" :youtubeUrl="youtubeUrl" 
    />

    <!-- Chat feed -->
    <ChatFeed
      :hideCommentBox="false"
      class="mt-3 scroll-500"
      :chatContext="$config.public.chat.contexts.nftLaunchpad"
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

  <!-- Change media modal -->
  <ChangeMediaModal :cAddress="cAddress" :mdAddress="mdAddress" />

  <!-- Change Metadata URL Modal -->
  <ChangeNftTypeModal :mdAddress="mdAddress" :cType="cType" :cAddress="cAddress" @saveCollection="saveCollection" />

  <!-- Remove Image From Collection Modal -->
  <RemoveImageFromCollectionModal :mdAddress="mdAddress" :cAddress="cAddress" />

  <!-- Send NFT Modal -->
  <SendNftModal v-if="address" :address="address" :cAddress="cAddress" />

</template>

<script>
import axios from 'axios'
import { isAddress, formatEther } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import ChatFeed from '@/components/chat/ChatFeed.vue'
import ConnectWalletButton from '@/components/connect/ConnectWalletButton.vue'
import Image from '@/components/Image.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import WaitingToast from '@/components/WaitingToast'
import AddImageToCollectionModal from '@/components/nft/collection/AddImageToCollectionModal'
import ChangeCollectionPreviewModal from '@/components/nft/collection/ChangeCollectionPreviewModal'
import ChangeDescriptionModal from '@/components/nft/collection/ChangeDescriptionModal'
import ChangeMediaModal from '@/components/nft/collection/ChangeMediaModal'
import ChangeNftTypeModal from '@/components/nft/collection/ChangeNftTypeModal'
import CollectionMediaSection from '@/components/nft/collection/CollectionMediaSection.vue';
import RemoveImageFromCollectionModal from '@/components/nft/collection/RemoveImageFromCollectionModal'
import SendNftModal from '@/components/nft/collection/SendNftModal.vue';

import { shortenAddress } from '@/utils/addressUtils'
import { fetchCollection, fetchUsername, storeCollection, storeUsername } from '@/utils/browserStorageUtils'
import { readData, writeData } from '@/utils/contractUtils'
import { getDomainName } from '@/utils/domainUtils'
import { getIpfsUrl } from '@/utils/fileUtils'
import { getTextWithoutBlankCharacters } from '@/utils/textUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

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
    ChangeMediaModal,
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
    // Wait for next tick to ensure computed properties are resolved
    this.$nextTick(() => {
      if (this.cAddress && isAddress(this.cAddress)) {
        this.getCollectionDetails()
      } else if (this.$route.query?.id) {
        // If we have a query param but cAddress is still null, there's an issue
        console.error('Route has query param but cAddress is null or invalid')
        this.toast('Invalid NFT address.', { type: 'error' })
        this.$router.push({ path: '/' })
      } else {
        console.log('No valid address found in mounted')
      }
    })
  },

  computed: {
    cAddress() {
      const address = this.$route.query?.id
      
      if (address) {
        return address
      }

      return null
    },

    collectionExplorerLink() {
      return this.$config.public.blockExplorerBaseUrl+"/token/"+this.cAddress;
    },

    collectionMarketplaceLink() {
      return this.$config.public.marketplaceNftCollectionBaseUrl + this.cAddress
    },

    getUsernameOrFullAddress() {
      if (this.cAuthorDomain) {
        let cleanName = String(this.cAuthorDomain).replace(this.$config.public.tldName, '')
        return getTextWithoutBlankCharacters(cleanName) + this.$config.public.tldName
      } else {
        return this.cAuthorAddress
      }
    },

    getUsernameOrShortAddress() {
      if (this.cAuthorAddress) {
        if (this.cAuthorDomain) {
          let cleanName = String(this.cAuthorDomain).replace(this.$config.public.tldName, '')
          return getTextWithoutBlankCharacters(cleanName) + this.$config.public.tldName
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
      if (this.chainId === this.$config.public.supportedChainId) {
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

      const nftAbi = [
        {
          name: 'getBurnPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'getMintPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'payable',
          inputs: [{ name: 'to', type: 'address' }],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'tokenOfOwnerByIndex',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'index', type: 'uint256' }
          ],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'totalSupply',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        }
      ]

      // fetch the price again to get the latest price
      try {
        const priceResult = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'getMintPrice',
        })

        this.priceBuyWei = priceResult
      } catch (e) {
        console.error('Failed to get mint price:', e)
        this.waitingBuy = false
        this.toast('Failed to get mint price.', { type: 'error' })
        return
      }

      let toastWait;

      try {
        const hash = await writeData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'mint',
          args: [this.address],
          value: BigInt(this.priceBuyWei),
        })

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          },
        )

        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.toast('You have successfully bought the NFT! Congrats!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          // Update prices and user data
          try {
            const [newPriceBuy, newPriceSell] = await Promise.all([
              readData({
                address: this.cAddress,
                abi: nftAbi,
                functionName: 'getMintPrice',
              }),
              readData({
                address: this.cAddress,
                abi: nftAbi,
                functionName: 'getBurnPrice',
              })
            ])
            
            this.priceBuyWei = newPriceBuy
            this.priceSellWei = newPriceSell

            try {
              const userTokenIdResult = await readData({
                address: this.cAddress,
                abi: nftAbi,
                functionName: 'tokenOfOwnerByIndex',
                args: [this.address, BigInt(0)],
              })

              if (userTokenIdResult) {
                this.userTokenId = Number(userTokenIdResult)
              } else {
                this.userTokenId = null
              }
            } catch (e) {
              this.userTokenId = null
            }

            const cSupplyResult = await readData({
              address: this.cAddress,
              abi: nftAbi,
              functionName: 'totalSupply',
            })

            if (cSupplyResult) {
              this.cSupply = Number(cSupplyResult)
            } else {
              this.cSupply = null
            }
          } catch (e) {
            console.error('Failed to update data after purchase:', e)
          }

          this.waitingBuy = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingBuy = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingBuy = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingBuy = false
      }
    },

    async fetchUserDomain() {
      if (this.cAuthorAddress) {
        const userDomain = await this.getDomainName(this.cAuthorAddress)

        if (userDomain) {
          const fullDomainName = userDomain.split('.')[0] + this.$config.public.tldName
          this.cAuthorDomain = fullDomainName

          storeUsername(window, this.cAuthorAddress, fullDomainName)
        }
      }
    },

    formatPrice(priceWei) {
      if (priceWei === null) {
        return null
      }

      const price = Number(formatEther(priceWei))

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
      // Add comprehensive address validation guard to prevent contract calls with invalid address
      if (!this.cAddress || !isAddress(this.cAddress)) {
        console.warn('cAddress is null or invalid:', this.cAddress, 'cannot fetch collection details')
        this.waitingData = false
        return
      }

      this.waitingData = true

      let collection = fetchCollection(window, this.cAddress)

      if (refresh) {
        collection = null
      }

      const nftAbi = [
        {
          name: 'getBurnPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'getMintPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'metadataAddress',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'address' }]
        },
        {
          name: 'name',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'owner',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'address' }]
        },
        {
          name: 'tokenOfOwnerByIndex',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'index', type: 'uint256' }
          ],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'totalSupply',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        }
      ]

      if (collection?.mdAddress) {
        this.mdAddress = collection.mdAddress;
      } else {
        try {
          this.mdAddress = await readData({
            address: this.cAddress,
            abi: nftAbi,
            functionName: 'metadataAddress',
          });
        } catch (e) {
          return this.getCollectionDetailsFallback();
        }
      }

      const metadataAbi = [
        {
          name: 'getCollectionDescription',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'nftAddress', type: 'address' }],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'getCollectionMetadataType',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'nftAddress_', type: 'address' }],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'getCollectionName',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'nftAddress_', type: 'address' }],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'getCollectionPreviewImage',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'nftAddress', type: 'address' }],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'getMetadata',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'nftAddress_', type: 'address' },
            { name: 'tokenId_', type: 'uint256' }
          ],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'mdContractType',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string' }]
        }
      ];

      // get collection details
      try {
        const [priceBuy, priceSell] = await Promise.all([
          readData({
            address: this.cAddress,
            abi: nftAbi,
            functionName: 'getMintPrice',
          }),
          readData({
            address: this.cAddress,
            abi: nftAbi,
            functionName: 'getBurnPrice',
          })
        ])
        
        this.priceBuyWei = priceBuy
        this.priceSellWei = priceSell
      } catch (e) {
        return this.getCollectionDetailsFallback();
      }

      // get image
      if (collection?.image) {
        this.cImage = collection.image
      } else {
        this.cImage = await readData({
          address: this.mdAddress,
          abi: metadataAbi,
          functionName: 'getCollectionPreviewImage',
          args: [this.cAddress],
        })
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
        this.cDescription = await readData({
          address: this.mdAddress,
          abi: metadataAbi,
          functionName: 'getCollectionDescription',
          args: [this.cAddress],
        })
      }

      // get type
      if (collection?.type >= 0) {
        this.cType = collection.type
      } else {
        this.cType = Number(await readData({
          address: this.mdAddress,
          abi: metadataAbi,
          functionName: 'getCollectionMetadataType',
          args: [this.cAddress],
        }))
      }

      // get name
      if (collection?.name) {
        this.cName = collection.name
      } else {
        this.cName = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'name',
        })
      }

      try {
        // Only call tokenOfOwnerByIndex if user has a valid wallet address
        if (this.address && isAddress(this.address)) {
          const userTokenIdResult = await readData({
            address: this.cAddress,
            abi: nftAbi,
            functionName: 'tokenOfOwnerByIndex',
            args: [this.address, BigInt(0)],
          })

          if (userTokenIdResult) {
            this.userTokenId = Number(userTokenIdResult)
          } else {
            this.userTokenId = null
          }
        } else {
          this.userTokenId = null
        }
      } catch (e) {
        //console.warn('Error getting user token ID:', e)
        this.userTokenId = null
      }

      this.waitingData = false

      this.cSupply = await readData({
        address: this.cAddress,
        abi: nftAbi,
        functionName: 'totalSupply',
      })

      // get author address
      if (collection?.authorAddress) {
        this.cAuthorAddress = collection.authorAddress
        this.cAuthorDomain = collection.authorDomain
      } else {
        this.cAuthorAddress = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'owner',
        })
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
      
      let metadata = await readData({
        address: this.mdAddress,
        abi: metadataAbi,
        functionName: 'getMetadata',
        args: [this.cAddress, BigInt(mdTokenId)],
      });

      if (String(metadata).startsWith("http")) {
        metadata = getIpfsUrl(metadata);
      }

      // if metadata starts with "ipfs://" convert it into default IPFS gateway link
      if (String(metadata).startsWith("ipfs://")) {
        metadata = String(metadata).replace("ipfs://", this.$config.public.ipfsGateway);
      }

      // if it starts with http, fetch data with axios
      if (String(metadata).startsWith("http")) {
        try {
          const response = await axios.get(metadata);
          metadata = response.data;
        } catch (e) {
          console.error(e);

          if (metadata.startsWith(this.$config.public.ipfsGateway)) {
            try {
              metadata = String(metadata).replace(this.$config.public.ipfsGateway, this.$config.public.ipfsGateway2);
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
          const mdContractType = await readData({
            address: this.mdAddress,
            abi: metadataAbi,
            functionName: 'mdContractType',
          });

          if (mdContractType == "media") {
            this.mediaMetadataContract = true;
          }
        } catch (e) {
          console.log("Not media metadata contract.");
        }
      }
    },

    async getCollectionDetailsFallback() {
      // Add null check guard to prevent contract calls with invalid address
      if (!this.cAddress) {
        console.warn('cAddress is null, cannot fetch collection details via fallback')
        return
      }

      // this function is called if the NFT contract was not created via NFTdegen
      this.nativeNft = false;

      const nftAbi = [
        {
          name: 'name',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'owner',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'address' }]
        },
        {
          name: 'tokenURI',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          outputs: [{ type: 'string' }]
        },
        {
          name: 'totalSupply',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'uri',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          outputs: [{ type: 'string' }]
        }
      ];

      // fetch name
      this.cName = await readData({
        address: this.cAddress,
        abi: nftAbi,
        functionName: 'name',
      });

      let tokenURI;

      try { // ERC-721
        tokenURI = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'tokenURI',
          args: [BigInt(1)],
        });
      } catch (e) { // ERC-1155
        tokenURI = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'uri',
          args: [BigInt(1)],
        });
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
        this.cSupply = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'totalSupply',
        });
      } catch (e) {
        console.log("No totalSupply function in the contract.");
      }

      // try-catch for owner
      try {
        this.cAuthorAddress = await readData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'owner',
        });
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

      const nftAbi = [
        {
          name: 'getBurnPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'getMintPrice',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'burn',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'tokenOfOwnerByIndex',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'index', type: 'uint256' }
          ],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'totalSupply',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }]
        }
      ]

      let toastWait;

      try {
        const hash = await writeData({
          address: this.cAddress,
          abi: nftAbi,
          functionName: 'burn',
          args: [BigInt(this.userTokenId)],
        })

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          },
        )

        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.toast('You have dumped the NFT.', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          // Update prices and user data
          try {
            const [newPriceBuy, newPriceSell] = await Promise.all([
              readData({
                address: this.cAddress,
                abi: nftAbi,
                functionName: 'getMintPrice',
              }),
              readData({
                address: this.cAddress,
                abi: nftAbi,
                functionName: 'getBurnPrice',
              })
            ])
            
            this.priceBuyWei = newPriceBuy
            this.priceSellWei = newPriceSell

            try {
              if (this.address) {
                const userTokenIdResult = await readData({
                  address: this.cAddress,
                  abi: nftAbi,
                  functionName: 'tokenOfOwnerByIndex',
                    args: [this.address, BigInt(0)],
                })

                if (userTokenIdResult) {
                  this.userTokenId = Number(userTokenIdResult)
                } else {
                  this.userTokenId = null
                }
              }
            } catch (e) {
              this.userTokenId = null
            }

            this.cSupply = await readData({
              address: this.cAddress,
              abi: nftAbi,
              functionName: 'totalSupply',
            })
          } catch (e) {
            console.error('Failed to update data after sale:', e)
          }

          this.waitingSell = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingSell = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)
        
        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingSell = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingSell = false
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address, chainId, isConnected } = useAccount({ config })
    const toast = useToast()

    return { 
      address, 
      chainId, 
      isConnected, 
      toast 
    }
  },

  watch: {
    address(newValue, oldValue) {
      if (oldValue && oldValue !== newValue && !this.waitingData) {
        this.getCollectionDetails()
      }
    },

    chainId(newValue, oldValue) {
      if (newValue == this.$config.public.supportedChainId && oldValue !== newValue && !this.waitingData) {
        this.getCollectionDetails()
      }
    },

    cAddress(newValue, oldValue) {
      // Only proceed if we have a valid new value
      if (newValue && this.$route.path === '/nft/collection') {
        if (!isAddress(newValue)) {
          this.toast('Invalid NFT address.', { type: 'error' })
          return this.$router.push({ path: '/' })
        }
        
        // Only call if we're not already waiting for data
        if (!this.waitingData) {
          this.getCollectionDetails()
        }
      }
    },
  },
}
</script>
