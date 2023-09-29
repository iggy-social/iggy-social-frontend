<template>
  <Head>
    <Title>NFT Collection Details | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'NFT Collection Details | ' + $config.projectMetadataTitle" />

    <Meta name="description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />

    <Meta property="og:image" :content="$config.projectUrl+$config.previewImageNftCollection" />
    <Meta property="og:description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImageNftCollection" />
    <Meta name="twitter:description" :content="'Check this NFT collection on ' + $config.projectName + '!'" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.push({ path: '/nft' })">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3" v-if="!cName">NFT Collection Details</h3>
      <h3 class="mb-3 mt-3" v-if="cName">{{ cName }}</h3>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <div class="row">

        <div class="col-md-5 text-center mb-3">
          <img :src="cImage" class="img-fluid img-thumbnail rounded col-12" />

          <div class="dropdown mt-3">
            <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Actions
            </button>
            <ul class="dropdown-menu">
              <li v-if="isCurrentAddressOwner"><span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#changeImageModal">Edit image</span></li>
              <li><span class="dropdown-item cursor-pointer" @click="getCollectionDetails(true)">Refresh metadata</span></li>
            </ul>
          </div>

        </div>

        <div class="col-md-7">
          <!--
          <h3 class="mb-3">Collection: {{ cName }}</h3>
          -->

          <!-- Data -->
          <div class="mt-1 mb-4 muted-text" style="font-size: 14px;">

            <p class="me-4">
              <i class="bi bi-file-earmark-text-fill me-1"></i>
              {{ cDescription }}
            </p>

            <p class="me-4">
              <i class="bi bi-coin me-1"></i>
              Buy/Sell price: {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }} / {{ formatPrice(priceSellWei) }} {{ $config.tokenSymbol }}
            </p>

            <p class="me-4">
              <i class="bi bi-file-earmark-binary me-1"></i>
              {{ cSupply }} NFTs minted
            </p>

            <p class="me-4">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a :href="$config.blockExplorerBaseUrl+'/address/'+cAddress" target="_blank" style="text-decoration: none;">
                {{ shortenAddress(cAddress) }}
              </a>
              <span v-if="getUsernameOrShortAddress"> by 
                <NuxtLink :to="'/profile/?id='+String(getUsernameOrFullAddress)">{{getUsernameOrShortAddress}}</NuxtLink>
              </span>
            </p>

            <p class="me-4">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a :href="$config.marketplaceNftCollectionBaseUrl+cAddress" target="_blank" style="text-decoration: none;">
                See on NFT marketplace
              </a>
            </p>
          </div>
          <!-- END Data -->

          <!-- Buttons -->
          <div class="row mb-3">

            <div v-if="!isActivated" class="d-grid gap-2 col">
              <ConnectWalletButton class="btn btn-primary" btnText="Connect wallet" />
            </div>

            <div v-if="isActivated" class="d-grid gap-2 col">
              <button @click="buyNft" class="btn btn-primary" type="button" :disabled="waitingData || waitingBuy" >
                <span v-if="waitingBuy" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
                Buy for {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }}
              </button>
            </div>

            <div v-if="isActivated" class="d-grid gap-2 col">
              <button @click="sellNft" class="btn btn-primary" type="button" :disabled="waitingData || waitingSell || !userTokenId || priceSellWei == 0" >
                <span v-if="waitingSell" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
                Sell for {{ formatPrice(priceSellWei) }} {{ $config.tokenSymbol }}
              </button>
            </div>
            
          </div>

          <small v-if="isActivated">
            <em>
              (Price may still change after pressing the button, so make sure to check the {{ $config.tokenSymbol }} amount in wallet.)
            </em>
          </small>
          <!-- END Buttons -->

        </div>
      </div>

    </div>
  </div>

  <!-- Alert to buy an NFT to chat -->
  <div v-if="!userTokenId" class="card border mt-3 scroll-500">
    <div class="card-body">

      <h5 class="mb-2 mt-3 text-center">Buy an NFT to see the chat</h5>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">

          <p class="text-break text-center mt-3 mb-4">
            This NFT's chat is open only for NFT holders. Buy an NFT to see the chat and talk with the NFT creator and other NFT holders.
          </p>

        </div>
      </div>

    </div>
  </div>

  <!-- Chat feed -->
  <ChatFeed 
    v-if="$config.nftOrbisContext && userTokenId" 
    :key="cAddress"
    :allPosts="true" 
    class="mt-3 scroll-500" 
    :showQuotedPost="$config.showRepliesOnHomepage" 
    :orbisContext="$config.nftOrbisContext+':'+cAddress" 
  />

  <!-- Change Image Modal -->
  <div class="modal fade" id="changeImageModal" tabindex="-1" aria-labelledby="changeImageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="changeImageModalLabel">Change Image or Metadata URL</h1>
          <button id="closeChangeImageModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p><strong>Pick one of these options:</strong></p>

          <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ editImageOptions[editImageChoice].description }}
            </button>
            <div class="dropdown-menu text-break">

              <span v-for="(option, index) in editImageOptions" :key="index" @click="editImageChoice = index" class="dropdown-item cursor-pointer">
                {{ option.description }}
              </span>

            </div>
          </div>

          <div class="mt-3">
            <p v-if="editImageChoice==0">
              The "Static image URL" option means that all the NFTs in the collection have the same (static) image. The metadata is stored 
              onchain (within the smart contract itself). Use this option if you want to add an image URL 
              (not a metadata file).
            </p>

            <p v-if="editImageChoice==1">
              The "Static metadata URL" option means that all the NFTs in the collection have the same (static) image and meta data. The 
              metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you have a URL of 
              a single metadata <strong>file</strong> (all NFTs have the same metadata and image).
            </p>

            <p v-if="editImageChoice==2">
              The "Generative metadata URL (with .json)" option means that all the NFTs in the collection have a different image and 
              different meta data. The metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you 
              have a metadata <strong>folder</strong> URL with multiple metadata files in it, where these files HAVE a .json extension.
            </p>

            <p v-if="editImageChoice==3">
              The "Generative metadata URL (without .json)" option means that all the NFTs in the collection have a different image and 
              different meta data. The metadata is stored offchain, usually on IPFS or on a centralized server. Use this option if you 
              have a metadata <strong>folder</strong> URL with multiple metadata files in it, where these files DO NOT HAVE a .json extension.
            </p>
          </div>

          <div class="mt-4">
            <label for="imageMetadataUrl" class="form-label">
              <strong>
                Enter 
                <span v-if="editImageChoice==0">image URL:</span>
                <span v-if="editImageChoice==1">metadata file URL:</span>
                <span v-if="editImageChoice==2">metadata folder URL:</span>
                <span v-if="editImageChoice==3">metadata folder URL:</span>
              </strong>
            </label>

            <input v-model="editImageMetadataUrl" type="text" class="form-control" id="imageMetadataUrl">
          </div>

          <div class="mt-4" v-if="editImageChoice > 0">
            <label for="collectionPreviewUrl" class="form-label">
              <strong>
                Change collection preview image (optional):
              </strong>
            </label>

            <input v-model="editImagePreviewUrl" type="text" class="form-control" id="collectionPreviewUrl" aria-describedby="previewImageHelp">
            <div id="previewImageHelp" class="form-text">This is a preview image for the whole collection, not for individual NFTs.</div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <button @click="updateMetadata" type="button" class="btn btn-primary" :disabled="!editImageMetadataUrl || waitingMetadata">
            <span v-if="waitingMetadata" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers, shortenAddress } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import ChatFeed from "~/components/chat/ChatFeed.vue";
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import WaitingToast from "~/components/WaitingToast";
import { getDomainName } from '~/utils/domainUtils';
import { fetchCollection, fetchUsername, storeCollection, storeUsername } from '~/utils/storageUtils';
import { getTextWithoutBlankCharacters } from '~/utils/textUtils';

export default {
  name: 'NftCollection',

  data() {
    return {
      cAddress: null,
      cAuthorAddress: null,
      cAuthorDomain: null,
      cDescription: null,
      cImage: null,
      cName: null,
      cSupply: null,
      editImageChoice: 0, // 0 = static image URL, 1 = static metadata URL, 2 = generative metadata URL, 3 = generative metadata URL without .json extension
      editImageMetadataUrl: null,
      editImageOptions: [
        { description: "Static image URL (same for all NFTs)" },
        { description: "Static metadata URL (same for all NFTs)" },
        { description: "Generative metadata URL (with .json)" },
        { description: "Generative metadata URL (without .json)" }
      ],
      editImagePreviewUrl: "", // important: should be empty string, not null
      mdAddress: null,
      priceBuyWei: null,
      priceSellWei: null,
      userTokenId: null, // if user owns at least one NFT, this will be set to the first token ID that user owns
      waitingBuy: false,
      waitingData: false,
      waitingMetadata: false,
      waitingSell: false,
    }
  },

  components: {
    ChatFeed,
    ConnectWalletButton,
    WaitingToast
  },

  mounted() {
    this.cAddress = this.$route.query.id;

    if (this.cAddress) {
      this.getCollectionDetails();
    }
  },

  computed: {
    getUsernameOrFullAddress() {
      if (this.cAuthorDomain) {
        let cleanName = String(this.cAuthorDomain).replace(this.$config.tldName, "");
        return getTextWithoutBlankCharacters(cleanName) + this.$config.tldName;
      } else {
        return this.cAuthorAddress;
      }
    },

    getUsernameOrShortAddress() {
      if (this.cAuthorAddress) {
        if (this.cAuthorDomain) {
          let cleanName = String(this.cAuthorDomain).replace(this.$config.tldName, "");
          return getTextWithoutBlankCharacters(cleanName) + this.$config.tldName;
        } else {
          return shortenAddress(this.cAuthorAddress);
        }
      }

      return null;
    },

    isCurrentAddressOwner() {
      if (this.cAuthorAddress && this.address) {
        return String(this.cAuthorAddress).toLowerCase() === String(this.address).toLowerCase();
      }

      return false;
    }
  },

  methods: {
    getDomainName,

    async buyNft() {
      this.waitingBuy = true;

      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function mint(address to) external payable returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)"
      ]);

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer);

      // fetch the price again to get the latest price
      this.priceBuyWei = await nftContract.getMintPrice();

      try {
        const tx = await nftContract.mint(this.address, {
          value: this.priceBuyWei
        });

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully bought the NFT! Congrats!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.priceBuyWei = await nftContract.getMintPrice();
          this.priceSellWei = await nftContract.getBurnPrice();

          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0);
          } catch (e) {
            this.userTokenId = null;
          }
          
          this.cSupply = await nftContract.totalSupply();

          this.waitingBuy = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingBuy = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingBuy = false;
      }
    },

    async fetchUserDomain() {
      if (this.cAuthorAddress) {
        const userDomain = await this.getDomainName(this.cAuthorAddress);

        if (userDomain) {
          this.cAuthorDomain = userDomain;
          storeUsername(window, this.cAuthorAddress, userDomain+this.$config.tldName);
        }
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

    async getCollectionDetails(refresh=false) {
      this.waitingData = true;

      let collection = fetchCollection(window, this.cAddress);

      if (refresh) {
        console.log("Refreshing collection metadata...");
        collection = null;
      }

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      const nftInterface = new ethers.utils.Interface([
        "function collectionPreview() public view returns (string memory)",
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function metadataAddress() public view returns (address)",
        "function name() public view returns (string memory)",
        "function owner() public view returns (address)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)"
      ]);

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, provider);

      if (collection?.mdAddress) {
        this.mdAddress = collection.mdAddress;
      } else {
        this.mdAddress = await nftContract.metadataAddress();
      }

      const metadataInterface = new ethers.utils.Interface([
        "function descriptions(address) public view returns (string memory)",
        "function names(address) public view returns (string memory)"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, provider);

      // get collection details
      this.priceBuyWei = await nftContract.getMintPrice();
      this.priceSellWei = await nftContract.getBurnPrice();

      // get image
      if (collection?.image) {
        this.cImage = collection.image;
      } else {
        this.cImage = await nftContract.collectionPreview();
      }

      // get description
      if (collection?.description && collection.description !== "" && collection.description !== null) {
        this.cDescription = collection.description;
      } else {
        this.cDescription = await metadataContract.descriptions(this.cAddress);
      }

      // get name
      if (collection?.name) {
        this.cName = collection.name;
      } else {
        this.cName = await nftContract.name();
      }

      try {
        this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0);
      } catch (e) {
        this.userTokenId = null;
      }

      this.waitingData = false;

      this.cSupply = await nftContract.totalSupply();

      // get author address
      if (collection?.authorAddress) {
        this.cAuthorAddress = collection.authorAddress;
        this.cAuthorDomain = collection.authorDomain;
      } else {
        this.cAuthorAddress = await nftContract.owner();
      }
      
      // get username from storage
      this.cAuthorDomain = fetchUsername(window, this.cAuthorAddress);

      if (!this.cAuthorDomain) {
        this.fetchUserDomain();
      }

      // create collection object, JSON.stringify it and save it to session storage
      collection = {
        address: this.cAddress,
        authorAddress: this.cAuthorAddress,
        authorDomain: this.cAuthorDomain,
        description: this.cDescription,
        image: this.cImage,
        mdAddress: this.mdAddress,
        name: this.cName
      };
      
      storeCollection(window, this.cAddress, collection);
    },

    async sellNft() {
      this.waitingSell = true;

      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function burn(uint256 tokenId) external returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)"
      ]);

      const nftContract = new ethers.Contract(this.cAddress, nftInterface, this.signer);

      try {
        const tx = await nftContract.burn(this.userTokenId); 

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have dumped the NFT.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.priceBuyWei = await nftContract.getMintPrice();
          this.priceSellWei = await nftContract.getBurnPrice();
          
          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(this.address, 0);
          } catch (e) {
            this.userTokenId = null;
          }

          this.cSupply = await nftContract.totalSupply();

          this.waitingSell = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingSell = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingSell = false;
      }
    },

    async updateMetadata() {
      this.waitingMetadata = true;

      const metadataInterface = new ethers.utils.Interface([
        "function setMdTypeAndUrlOrImage(address nftAddress_, uint256 mdType_, string memory mdUrlOrImage_, string memory collectionImage_) external"
      ]);
      
      const metadataContract = new ethers.Contract(this.mdAddress, metadataInterface, this.signer);

      if (this.editImageChoice === 0) {
        this.editImagePreviewUrl = this.editImageMetadataUrl;
      }

      if (this.editImagePreviewUrl === null) {
        this.editImagePreviewUrl = "";
      }

      try {
        const tx = await metadataContract.setMdTypeAndUrlOrImage(
          this.cAddress,
          this.editImageChoice,
          this.editImageMetadataUrl,
          this.editImagePreviewUrl
        ); 

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have updated the NFT image and/or metadata URL.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          if (this.editImagePreviewUrl) {
            this.cImage = this.editImagePreviewUrl;

            // create collection object, JSON.stringify it and save it to session storage
            const collection = {
              address: this.cAddress,
              authorAddress: this.cAuthorAddress,
              authorDomain: this.cAuthorDomain,
              description: this.cDescription,
              image: this.cImage,
              mdAddress: this.mdAddress,
              name: this.cName
            };

            storeCollection(window, this.cAddress, collection);
          }

          this.editImageMetadataUrl = null;
          this.editImagePreviewUrl = ""; // important: should be empty string, not null

          // close the modal
          document.getElementById('closeChangeImageModal').click();

          this.waitingMetadata = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingMetadata = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('"', "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingMetadata = false;
      }
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();

    return { address, chainId, isActivated, shortenAddress, signer, toast }
  },
};
</script>
