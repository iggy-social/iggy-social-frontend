<template>
  <Head>
    <Title>Create NFT Collection | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Create NFT Collection | ' + $config.public.projectMetadataTitle" />

    <Meta name="description" :content="'Create your very own NFT collection on ' + $config.public.projectName + '!'" />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageNftCreate" />
    <Meta property="og:description" :content="'Create your very own NFT collection on ' + $config.public.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageNftCreate" />
    <Meta name="twitter:description" :content="'Create your very own NFT collection on ' + $config.public.projectName + '!'" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mb-4 mt-3">Create NFT Collection</h3>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <p class="mb-4" v-if="createPrice">
        Price for creating a collection is {{ createPrice }} {{ $config.public.tokenSymbol }}.
      </p>

      <!-- Collection Name -->
      <div class="mb-4">
        <label for="cName" class="form-label">Collection Name</label>
        <input
          type="text"
          class="form-control"
          id="cName"
          aria-describedby="cNameHelp"
          placeholder="e.g. Crypto Punks"
          v-model="cName"
        />
        <div id="cNameHelp" class="form-text">This is not a token name, but the whole collection name.</div>
      </div>

      <!-- Symbol -->
      <div class="mb-4">
        <label for="cSymbol" class="form-label">Collection Symbol</label>
        <input
          type="text"
          class="form-control"
          id="cSymbol"
          aria-describedby="cSymbolHelp"
          placeholder="e.g. PUNKS"
          v-model="cSymbol"
        />
        <div id="cSymbolHelp" class="form-text">
          Collection symbol (required by the ERC-721 smart contract, but not really important).
        </div>
      </div>

      <!-- Image -->
      <div class="mb-2">
        <label for="cImage" class="form-label">Collection Image (can be changed later)</label>
        <div class="input-group" aria-describedby="cImageHelp" id="cImage">
          <input
            v-model="cImage"
            type="text"
            class="form-control"
            placeholder="Enter image URL or click the upload button"
          />

          <button
            v-if="isConnected && $config.public.fileUploadEnabled !== ''"
            class="btn btn-outline-secondary rounded-end-2"
            data-bs-toggle="modal"
            :data-bs-target="'#fileUploadModal' + $.uid"
          >
            <i class="bi bi-file-earmark-image-fill"></i>
            Upload
          </button>
        </div>
        <div id="cImageHelp" class="form-text">
          Even if you want a generative PFP collection, put a single preview image for now and you will change it to a
          metadata link later.
        </div>
      </div>

      <div v-if="cImage" class="mb-4">
        <Image :url="cImage" alt="Image" cls="img-thumbnail img-fluid" style="max-width: 100px" />
        <br />
        <small
          >If image didn't appear above, then something is wrong with the link you added (wait until the loading
          indicator completes). If you have an IPFS link, it also helps to cut/paste the same link a couple of
          times.</small
        >
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label for="cDescription" class="form-label">Collection Description (can be changed later)</label>
        <input
          type="text"
          class="form-control"
          id="cDescription"
          aria-describedby="cDescriptionHelp"
          placeholder="Keep it short and sweet."
          v-model="cDescription"
        />
        <div id="cDescriptionHelp" class="form-text">Too long description means higher gas cost for storing it.</div>
      </div>

      <!-- NFT Name 
			<div class="mb-4">
				<label for="nftName" class="form-label">NFT Name (can be changed later)</label>
				<input
					type="text"
					class="form-control"
					id="cDescription"
					aria-describedby="nftNameHelp"
					placeholder="Short, will show up next to each NFT, e.g. Punk"
					v-model="nftName"
				/>
				<div v-if="nftName" id="nftNameHelp" class="form-text">
					The first minted NFTs will be {{ nftName }} #1, {{ nftName }} #2, {{ nftName }} #3 etc.
				</div>
			</div>
			-->

      <!-- Advanced Settings Toggle -->
      <div>
      <small>
      <em>
        <span 
          class="link-without-color cursor-pointer hover-color" 
          @click="toggleAdvancedSettings"
          style="text-decoration: underline;"
        >
          {{ showAdvancedSettings ? 'Hide' : 'Show' }} Advanced Settings
        </span>
      </em>
      </small>
      </div>

      <!-- Advanced Settings -->
      <div v-show="showAdvancedSettings">
        <!-- Unique ID -->
        <div class="mb-4 mt-4">
          <label for="uniqueId" class="form-label">Unique ID (store it - just in case)</label>
          <input
            type="text"
            class="form-control"
            id="uniqueId"
            aria-describedby="uniqueIdHelp"
            disabled
            readonly
            v-model="uniqueId"
          />
          <div id="uniqueIdHelp" class="form-text">
            This is just in case the frontend will not show you the NFT collection address and you'll need to find it
            manually.
          </div>
        </div>

        <!-- Ratio -->
        <div class="mb-4">
          <label for="ratio" class="form-label">Bonding Curve Ratio</label>
          <input type="text" class="form-control" id="ratio" aria-describedby="ratioHelp" v-model="ratio" />
          <div id="ratioHelp" class="form-text">
            Price for mint #1 will be {{ getLessDecimals(calculatePrice(2, ratio)) }} {{ $config.public.tokenSymbol }}, for mint
            #5 will be {{ getLessDecimals(calculatePrice(5, ratio)) }} {{ $config.public.tokenSymbol }}, for mint #15 will be
            {{ getLessDecimals(calculatePrice(15, ratio)) }} {{ $config.public.tokenSymbol }}, for mint #30 will be
            {{ getLessDecimals(calculatePrice(30, ratio)) }} {{ $config.public.tokenSymbol }}, etc.
          </div>
        </div>
      </div>

      <!-- Buttons div -->
      <div class="d-flex justify-content-center mt-4 mb-5">
        <!-- Create Collection button -->
        <button
          :disabled="waitingCreate || !fieldsValid"
          v-if="isConnected && isSupportedChain && !launchpadPaused"
          class="btn btn-primary"
          type="button"
          @click="createCollection"
        >
          <span
            v-if="waitingData || waitingCreate"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Create NFT Collection for {{ createPrice }} {{ $config.public.tokenSymbol }}
        </button>

        <!-- Paused button -->
        <button :disabled="true" v-if="isConnected && isSupportedChain && launchpadPaused" class="btn btn-primary">
          Paused
        </button>

        <!-- Connect Wallet button -->
        <ConnectWalletButton
          v-if="!isConnected && !isSupportedChain"
          class="btn-primary"
          btnText="Connect wallet"
        />
        <SwitchChainButton v-if="isConnected && !isSupportedChain" />
      </div>

      <!-- Upload Image Modal -->
      <FileUploadModal
        v-if="isMounted"
        @processFileUrl="insertImage"
        title="Upload your NFT image"
        infoText="Upload the NFT image."
        :storageType="$config.public.fileUploadStorageType"
        :componentId="$.uid"
        :maxFileSize="$config.public.fileUploadSizeLimit"
      />
      <!-- END Upload Image Modal -->
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import { formatEther, parseEther } from 'viem'
import { useAccount, useConfig } from '@wagmi/vue'

import ConnectWalletButton from '@/components/connect/ConnectWalletButton.vue'
import Image from '@/components/Image.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import WaitingToast from '@/components/WaitingToast'
import FileUploadModal from '@/components/storage/FileUploadModal.vue'

import { fetchReferrer } from '@/utils/browserStorageUtils'
import { readData, writeData } from '@/utils/contractUtils'
import { getLessDecimals } from '@/utils/numberUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'NftCreate',

  data() {
    return {
      cDescription: null,
      cImage: null,
      cName: null,
      cSymbol: null,
      isMounted: false,
      launchpadPaused: null,
      nftName: null,
      createPriceWei: null,
      ratio: null,
      showAdvancedSettings: false,
      uniqueId: null,
      waitingCreate: false,
      waitingData: false,
    }
  },

  components: {
    ConnectWalletButton,
    FileUploadModal,
    Image,
    SwitchChainButton,
    WaitingToast,
  },

  mounted() {
    this.isMounted = true
    this.ratio = this.$config.public.nftDefaultRatio
    this.fetchData()
  },

  computed: {
    cleanDescription() {
      if (!this.cDescription) return null

      return this.cDescription.replace(/"/g, "'") // replace double quotes with single quotes
    },

    createPrice() {
      if (!this.createPriceWei) return null

      const price = Number(formatEther(this.createPriceWei))

      if (price > 0.01) {
        return Number.parseFloat(price.toFixed(5))
      } else if (price > 0.0001) {
        return Number.parseFloat(price.toFixed(7))
      } else {
        return Number.parseFloat(price)
      }
    },

    fieldsValid() {
      return this.cName && this.cSymbol && this.cImage && this.cDescription && this.ratio
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
    calculatePrice(nftId, ratio) {
      const supply = Number(nftId) - 1

      return (
        ((((supply * (supply + 1) * (2 * supply + 1) - (supply - 1) * supply * (2 * (supply - 1) + 1)) * 10000) /
          42069) *
          Number(ratio)) /
        31337
      )
    },

    async createCollection() {
      this.waitingCreate = true

      let toastWait;

      if (this.isConnected) {
        try {
          // Create launchpad contract object
          const launchpadInterface = [
            {
              name: 'launch',
              type: 'function',
              stateMutability: 'payable',
              inputs: [
                { name: 'contractOwner_', type: 'address' },
                { name: 'referrer_', type: 'address' },
                { name: 'mdDescription_', type: 'string' },
                { name: 'mdImage_', type: 'string' },
                { name: 'mdName_', type: 'string' },
                { name: 'name_', type: 'string' },
                { name: 'symbol_', type: 'string' },
                { name: 'uniqueId_', type: 'string' },
                { name: 'ratio_', type: 'uint256' }
              ],
              outputs: []
            }
          ]

          const launchpadContract = {
            address: this.$config.public.nftLaunchpadBondingAddress,
            abi: launchpadInterface,
            functionName: 'launch',
            args: [
              this.address, // contract owner
              fetchReferrer(window), // referrer
              this.cleanDescription, // collection description
              this.cImage, // collection image
              this.cName, // NFT name
              this.cName, // collection name
              this.cSymbol, // collection symbol
              this.uniqueId, // unique ID to easily find the NFT contract address
              parseEther(String(this.ratio)) // bonding curve ratio
            ],
            value: BigInt(this.createPriceWei) // price for creating collection
          }

          const hash = await writeData(launchpadContract)

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

            this.toast('You have successfully created an NFT collection!', {
              type: 'success',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
            })

            // after successful launch, fetch the collection address and redirect to the collection page
            const getNftContractAddressInterface = [
              {
                name: 'getNftContractAddress',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: '_uniqueId', type: 'string' }],
                outputs: [{ name: '', type: 'address' }]
              }
            ]

            const nftContractAddress = await readData({
              address: this.$config.public.nftLaunchpadBondingAddress,
              abi: getNftContractAddressInterface,
              functionName: 'getNftContractAddress',
              args: [this.uniqueId]
            })

            this.$router.push({ path: '/nft/collection', query: { id: nftContractAddress } })

            this.waitingCreate = false
          } else {
            this.toast.dismiss(toastWait)
            this.waitingCreate = false
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

          this.waitingCreate = false
        } finally {
          this.toast.dismiss(toastWait)
          this.waitingCreate = false
        }
      }

      this.waitingCreate = false
    },

    async fetchData() {
      this.waitingData = true

      try {
        // Create launchpad contract object for reading data
        const launchpadInterface = [
          {
            name: 'paused',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'bool' }]
          },
          {
            name: 'isUniqueIdAvailable',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: '_uniqueId', type: 'string' }],
            outputs: [{ name: '', type: 'bool' }]
          },
          {
            name: 'price',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ]

        // check if paused
        this.launchpadPaused = await readData({
          address: this.$config.public.nftLaunchpadBondingAddress,
          abi: launchpadInterface,
          functionName: 'paused',
          args: []
        })

        // generate unique ID and check if it's already been used
        this.uniqueId = Math.random().toString(36).slice(2)

        const isUniqueIdAvailable = await readData({
          address: this.$config.public.nftLaunchpadBondingAddress,
          abi: launchpadInterface,
          functionName: 'isUniqueIdAvailable',
          args: [this.uniqueId] // string
        })

        if (!isUniqueIdAvailable) {
          this.uniqueId = Math.random().toString(36).slice(10)
        }

        // get price for creating collection
        this.createPriceWei = await readData({
          address: this.$config.public.nftLaunchpadBondingAddress,
          abi: launchpadInterface,
          functionName: 'price',
          args: []
        })

        this.waitingData = false
      } catch (error) {
        console.error('Error fetching data:', error)
        this.waitingData = false
      }
    },

    insertImage(imageUrl) {
      this.cImage = imageUrl.replace('?.img', '')
    },

    toggleAdvancedSettings() {
      this.showAdvancedSettings = !this.showAdvancedSettings
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
}
</script>
