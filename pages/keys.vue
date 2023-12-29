<template>
  <Head>
    <Title>Friend Keys | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Friend Keys | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-2 mt-3 text-center">Get a Friend Key and unlock a chat room</h3>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">

          <p class="text-break text-center mt-3 mb-4">
            Search for a domain and get its Friend Key to unlock a chat room with the domain holder and other key holders.
          </p>

          <!-- Search domain input field -->
          <div class="input-group">
            <input 
              v-model="domainName"
              type="text" 
              placeholder="Enter domain name"
              class="form-control"
              v-on:keyup.enter="getData" 
            >

            <button @click="getData" class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ $config.tldName }}
            </button>
          </div>

          <div v-if="!isActivated" class="d-flex justify-content-center mt-4">
            <ConnectWalletButton v-if="!isActivated" class="btn btn-outline-primary" btnText="Connect wallet" />
          </div>

          <!-- Get Data button -->
          <div v-if="isActivated && !showBuySellButtons" class="d-flex justify-content-center mt-4">
            <button 
              :disabled="waitingData || !domainName"
              class="btn btn-outline-primary" 
              type="button"
              @click="getData"
            >
              <span v-if="waitingData" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-if="!domainName">Unlock Chat</span>
              <span v-if="domainName">Unlock {{ domainName }}'s Chat</span>
            </button>
          </div>

          <!-- Buy & Sell buttons -->
          <div v-if="isActivated && showBuySellButtons && !domainNotExists" class="d-flex justify-content-center mt-4 mb-4">

            <button 
              :disabled="waitingBuy || !domainName"
              class="btn btn-outline-primary" 
              type="button"
              @click="fetchBuyData" 
              data-bs-toggle="modal" data-bs-target="#buyKeyModal"
            >
              <span v-if="waitingBuy" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Buy Key
            </button>

            <button 
              :disabled="waitingSell || !domainName"
              class="btn btn-outline-primary ms-3" 
              type="button"
              @click="fetchSellData" 
              data-bs-toggle="modal" data-bs-target="#sellKeyModal"
            >
              <span v-if="waitingSell" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Sell Key
            </button>

          </div>

        </div>
      </div>

    </div>
  </div>

  <!-- KeysList -->
  <div v-if="!domainNotExists && !showBuySellButtons && !buyKeyToChat && !isKeyHolder" class="card border mt-3 scroll-500">
    <div class="card-body">

      <h3 class="mb-4 mt-3 text-center">Featured Keys List</h3>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">

          <KeysList />

        </div>
      </div>

    </div>
  </div>

  <!-- Alert that domain does not exist -->
  <div v-if="domainNotExists && !showBuySellButtons" class="card border mt-3 scroll-500">
    <div class="card-body">

      <h3 class="mb-2 mt-3 text-center">This domain does not exist.</h3>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">

          <p class="text-break mt-3 mb-4">
            Instead, try one of these:
            <ul>
              <li>techie{{ $config.tldName }}</li>
              <li>tekr{{ $config.tldName }}</li>
            </ul>
          </p>

        </div>
      </div>

    </div>
  </div>

  <!-- Alert to buy a key to chat -->
  <div v-if="buyKeyToChat" class="card border mt-3 scroll-500">
    <div class="card-body">

      <h3 class="mb-2 mt-3 text-center">Buy a key to see the chat</h3>

      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">

          <p class="text-break text-center mt-3 mb-4">
            The chat is open only for key holders. Buy a key to see the chat and talk with the 
            domain holder and other key holders.
          </p>

        </div>
      </div>

    </div>
  </div>

  <!-- Chat feed -->
  <ChatFeed 
    v-if="domainName && cleanDomainName && isKeyHolder && !waitingData && clean(domainName) === cleanDomainName" 
    :key="cleanDomainName"
    :allPosts="true" 
    class="mt-3" 
    :showQuotedPost="$config.showRepliesOnHomepage" 
    :orbisContext="$config.keysContext+':'+cleanDomainName" 
  />

  <!-- Buy key modal -->
  <div class="modal fade" id="buyKeyModal" tabindex="-1" aria-labelledby="buyKeyModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="buyKeyModalLabel">Buy one {{ cleanDomainName }}{{ $config.tldName }} key</h1>
          <button id="closeBuyKeyModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">

          Buy 1 {{ cleanDomainName }}{{ $config.tldName }} key for {{ buyKeyPrice }} {{ $config.tokenSymbol }}?

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="buyKey" :disabled="waitingBuy">
            <span v-if="waitingBuy" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            <span>Buy for {{ buyKeyPrice }} {{ $config.tokenSymbol }}</span>
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- Sell key modal -->
  <div class="modal fade" id="sellKeyModal" tabindex="-1" aria-labelledby="sellKeyModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="sellKeyModalLabel">Sell one {{ cleanDomainName }}{{ $config.tldName }} key</h1>
          <button id="closeSellKeyModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">

          Sell 1 {{ cleanDomainName }}{{ $config.tldName }} key for {{ sellKeyPrice }} {{ $config.tokenSymbol }}?

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="sellKey" :disabled="waitingSell">
            <span v-if="waitingSell" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
            <span>Sell for {{ sellKeyPrice }} {{ $config.tokenSymbol }}</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import ChatFeed from "~/components/chat/ChatFeed.vue";
import KeysList from "~/components/keys/KeysList.vue";
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import { fetchReferrer } from '~/utils/storageUtils';

export default {
  name: 'Keys',

  data() {
    return {
      buyKeyPriceWei: null,
      buyKeyToChat: false,
      cleanDomainName: null,
      domainName: null,
      domainNotExists: false,
      isKeyHolder: false,
      sellKeyPriceWei: null,
      showBuySellButtons: false,
      waitingBuy: false,
      waitingData: false,
      waitingSell: false
    }
  },

  components: {
    ChatFeed,
    ConnectWalletButton,
    KeysList
  },

  computed: {
    buyKeyPrice() {
      if (this.buyKeyPriceWei) {
        const kPrice = Number(ethers.utils.formatEther(this.buyKeyPriceWei));

        if (kPrice > 1) {
          return kPrice.toFixed(2);
        } else if (kPrice > 0.1) {
          return kPrice.toFixed(4);
        } else if (kPrice > 0.01) {
          return kPrice.toFixed(5);
        } else if (kPrice > 0.001) {
          return kPrice.toFixed(6);
        } else if (kPrice > 0.0001) {
          return kPrice.toFixed(7);
        } else if (kPrice > 0.00001) {
          return kPrice.toFixed(8);
        } else if (kPrice > 0.000001) {
          return kPrice.toFixed(9);
        } else {
          return kPrice;
        }
      }

      return null;
    },

    sellKeyPrice() {
      if (this.sellKeyPriceWei) {
        const kPrice = Number(ethers.utils.formatEther(this.sellKeyPriceWei));

        if (kPrice > 1) {
          return kPrice.toFixed(2);
        } else if (kPrice > 0.1) {
          return kPrice.toFixed(4);
        } else if (kPrice > 0.01) {
          return kPrice.toFixed(5);
        } else if (kPrice > 0.001) {
          return kPrice.toFixed(6);
        } else if (kPrice > 0.0001) {
          return kPrice.toFixed(7);
        } else if (kPrice > 0.00001) {
          return kPrice.toFixed(8);
        } else if (kPrice > 0.000001) {
          return kPrice.toFixed(9);
        } else {
          return kPrice;
        }
      }

      return null;
    }
  },

  methods: {
    async buyKey() {
      this.waitingBuy = true;

      // clean the domain name
      this.cleanDomainName = this.clean(this.domainName);

      const keysInterface = new ethers.utils.Interface([
        "function buyKeys(string memory domainName, uint256 amount, address referrer) external payable"
      ]);

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        this.signer
      );

      try {
        const tx = await keysContract.buyKeys(
          this.cleanDomainName, // domain name
          1, // amount
          fetchReferrer(window), // referrer
          {
            value: this.buyKeyPriceWei
          }
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

          this.toast(this.cleanDomainName + this.$config.tldName + " friend key has been successfully claimed! Now you can chat.", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          document.getElementById('closeBuyKeyModal').click();

          this.isKeyHolder = true;
          this.buyKeyToChat = false;
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
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingBuy = false;
      }
    },

    clean(domName) {
      return domName.split(".")[0].trim().toLowerCase();
    },

    async fetchBuyData() {
      this.buyKeyPriceWei = null;
      this.waitingBuy = true;

      const keysInterface = new ethers.utils.Interface([
        "function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"
      ]);

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        this.signer
      );

      this.buyKeyPriceWei = await keysContract.getBuyPriceAfterFee(this.cleanDomainName, 1); // buy only 1 key at a time

      this.waitingBuy = false;
    },

    async fetchSellData() {
      this.sellKeyPriceWei = null;
      this.waitingSell = true;

      const keysInterface = new ethers.utils.Interface([
        "function getSellPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"
      ]);

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        this.signer
      );

      this.sellKeyPriceWei = await keysContract.getSellPriceAfterFee(this.cleanDomainName, 1); // sell only 1 key at a time

      console.log("sellKeyPriceWei", this.sellKeyPriceWei);
      console.log("sellKeyPrice", ethers.utils.formatEther(this.sellKeyPriceWei));

      this.waitingSell = false;
    },

    async getData() {
      this.cleanDomainName = null;
      this.isKeyHolder = false;
      this.waitingData = true;

      //this.isKeyHolder = true; // TODO: remove this

      // clean the domain name
      this.cleanDomainName = this.clean(this.domainName);

      //return this.waitingData = false;

      const keysInterface = new ethers.utils.Interface([
        "function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)",
        "function getDomainHolder(string memory domainName) external view returns (address)",
        "function isKeyHolder(string memory domainName, address user) external view returns (bool)"
      ]);

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        this.signer
      );

      // first check if user is key holder
      this.isKeyHolder = await keysContract.isKeyHolder(this.cleanDomainName, this.address);

      if (this.isKeyHolder) {
        // if user is key holder, show the buy/sell buttons
        this.showBuySellButtons = true;
      } else {
        // else, check if domain has a holder
        const domainHolder = await keysContract.getDomainHolder(this.cleanDomainName);

        if (domainHolder === ethers.constants.AddressZero) {
          // if no holder, show the "not available" message + a list of domains that are available
          this.domainNotExists = true;
        } else {
          // else, show the buy/sell buttons and the message "buy a key to see the chat"
          this.showBuySellButtons = true;
          this.buyKeyToChat = true;
        }
          
      }
      
      this.waitingData = false;
    },

    async sellKey() {
      this.waitingSell = true;

      // clean the domain name
      this.cleanDomainName = this.clean(this.domainName);

      const keysInterface = new ethers.utils.Interface([
        "function isKeyHolder(string memory domainName, address user) external view returns (bool)",
        "function sellKeys(string memory domainName, uint256 amount) external payable"
      ]);

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        this.signer
      );

      try {
        const tx = await keysContract.sellKeys(this.cleanDomainName, 1);

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

          this.toast(this.cleanDomainName + this.$config.tldName + " friend key has been successfully sold!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          document.getElementById('closeSellKeyModal').click();

          this.isKeyHolder = false; // just in case the isKeyHolder call after this fails
          this.waitingSell = false;

          this.isKeyHolder = await keysContract.isKeyHolder(this.cleanDomainName, this.address);
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
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingSell = false;
      }
    },
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();

    return {
      address,
      isActivated,
      signer,
      toast
    }
  },

  watch: {
    domainName: function (val) {
      this.cleanDomainName = null;
      this.isKeyHolder = false;
      this.showBuySellButtons = false;
      this.domainNotExists = false;
      this.buyKeyToChat = false;
      this.buyKeyPriceWei = null;
      this.sellKeyPriceWei = null;
    }
  }
}
</script>