<template>
  <div>
    <Head>
      <Title>{{ $config.projectName }}</Title>
      <Meta name="description" :content="$config.projectDescription" />
      <Link rel="icon" type="image/x-icon" :href="$config.favicon" />

      <Meta property="og:title" :content="$config.projectName" />
      <Meta property="og:description" :content="$config.projectDescription" />
      <Meta property="og:image" :content="$config.previewImage" />
    </Head>

    <NavbarDesktop v-if="!isMobile" />
    <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

    <!-- Main content with sidebars -->
    <div class="container-fluid page-container">
      <div class="row flex-nowrap">

        <SidebarLeft :lSidebar="lSidebar" :isMobile="isMobile" />

        <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="sidebarStore.showMainContent">
          <slot></slot>
        </main>

        <SidebarRight />
        
      </div>
    </div>

    <!-- Connect Wallet modal -->
    <div class="modal modal-sm fade" id="connectModal" tabindex="-1" aria-labelledby="connectModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Connect your wallet</h5>
            <button id="closeConnectModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"></span>
            </button>
          </div>
          <div class="modal-body row">

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/metamask.png" class="card-img-top card-img-wallet" alt="MetaMask">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/bifrost.png" class="card-img-top card-img-wallet" alt="Bifrost">
            </div> 

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectWalletConnect">
              <img src="@/assets/img/wallets/wc.png" class="card-img-top card-img-wallet" alt="Wallet Connect">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectCoinbase">
              <img src="@/assets/img/wallets/coinbase.png" class="card-img-top card-img-wallet" alt="Coinbase">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/rabby.png" class="card-img-top card-img-wallet" alt="Rabby">
            </div> 

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/brave.png" class="card-img-top card-img-wallet" alt="Brave">
            </div>

            <!--
            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectWalletConnect">
              <img src="@/assets/img/wallets/minerva.png" class="card-img-top card-img-wallet" alt="Minerva">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectWalletConnect">
              <img src="@/assets/img/wallets/argent.png" class="card-img-top card-img-wallet" alt="Argent">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectWalletConnect">
              <img src="@/assets/img/wallets/1inch.png" class="card-img-top card-img-wallet" alt="1inch">
            </div>
            -->

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/trust.png" class="card-img-top card-img-wallet" alt="Trust Wallet">
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/imtoken.png" class="card-img-top card-img-wallet" alt="imToken">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END Connect Wallet modal -->
  </div>

  <!-- Do not delete: ugly hack to make "global" work with Vite -->
  <component :is="'script'">
  var global = global || window;
  </component>
</template>

<script>
import { ethers } from 'ethers';
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useEthers, useWallet } from 'vue-dapp';
import { useSidebarStore } from '~/store/sidebars';
import { useSiteStore } from '~/store/site';
import { useUserStore } from '~/store/user';
//import { useLocalStorage } from '@vueuse/core';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/data/resolvers.json";
import rpcs from "~/assets/data/rpcs.json";
import NavbarDesktop from "~/components/navbars/NavbarDesktop.vue";
import NavbarMobile from "~/components/navbars/NavbarMobile.vue";
import SidebarLeft from "~/components/sidebars/SidebarLeft.vue";
import SidebarRight from "~/components/sidebars/SidebarRight.vue";

export default {
  data() {
    return {
      breakpoint: 1000,
      isUserConnectedOrbis: false,
      lSidebar: null,
      rSidebar: null,
      width: null
    }
  },

  components: {
    NavbarDesktop,
    NavbarMobile,
    SidebarLeft,
    SidebarRight
  },

  created() {
		// if user already connected before, connect them automatically on the next visit
		
	},

  mounted() {
    if (!this.isActivated) {
			if (localStorage.getItem("connected") == "metamask") {
				this.connectMetaMask();
			} else if (localStorage.getItem("connected") == "walletconnect") {
				this.connectWalletConnect();
			} else if (localStorage.getItem("connected") == "coinbase") {
				this.connectCoinbase();
			}
		}

    document.documentElement.setAttribute("data-bs-theme", this.siteStore.getColorMode);

    this.lSidebar = new bootstrap.Collapse('#sidebar1', {toggle: false});
    this.rSidebar = new bootstrap.Collapse('#sidebar2', {toggle: false});
    this.width = window.innerWidth;

    if (this.width < this.breakpoint) {
      this.sidebarStore.setLeftSidebar(false);
      this.sidebarStore.setRightSidebar(false);
      this.lSidebar.hide();
      this.rSidebar.hide();
    } else {
      this.lSidebar.show();
      //this.rSidebar.show();
      this.sidebarStore.setLeftSidebar(true);
      this.sidebarStore.setRightSidebar(true);
    }

    window.addEventListener('resize', this.onWidthChange);
  },

  unmounted() {
    window.removeEventListener('resize', onWidthChange);
  },

  computed: {
    isMobile() {
      if (this.width < this.breakpoint) {
        return true;
      }
      return false;
    }
  },

  methods: {
    async fetchOrbisProfile() {
      if (this.isActivated) {
        let { data, error } = await this.$orbis.getDids(this.address);

        if (data[0].did) {
          const profile = await this.$orbis.getProfile(data[0].did);

          if (profile && profile.data.details.profile) {
            this.userStore.setOrbisImage(profile.data.details.profile.pfp);
          }

          if (profile) {
            this.userStore.setFollowers(profile.data.count_followers);
            this.userStore.setFollowing(profile.data.count_following);
            this.userStore.setLastActivityTimestamp(profile.data.last_activity_timestamp);
          }
        }
      }
    },

    async fetchChatTokenBalance() {
      if (this.$config.chatTokenAddress) {
        const chatTokenInterface = new ethers.utils.Interface([
          "function balanceOf(address owner) view returns (uint256)",
        ]);
        const chatTokenContract = new ethers.Contract(this.$config.chatTokenAddress, chatTokenInterface, this.signer);
        const balance = await chatTokenContract.balanceOf(this.address);
        this.userStore.setChatTokenBalanceWei(balance);
      }
    },

    async getOrbisDids() {
      this.isUserConnectedOrbis = await this.$orbis.isConnected();

      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },

    async connectCoinbase() {
			await this.connectWith(this.coinbaseConnector);
			localStorage.setItem("connected", "coinbase"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		},

		async connectMetaMask() {
			await this.connectWith(this.mmConnector);
			localStorage.setItem("connected", "metamask"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		},

		async connectWalletConnect() {
      document.getElementById('closeConnectModal').click();
			await this.connectWith(this.wcConnector);
			localStorage.setItem("connected", "walletconnect"); // store in local storage to autoconnect next time
		},

    async fetchUserDomain() {
      if (this.chainId === this.$config.supportedChainId) {
        const contract = new ethers.Contract(resolvers[this.chainId], ResolverAbi, this.signer);

        // get user's default domain
        const userDomain = await contract.getDefaultDomain(this.address, this.$config.tldName);

        if (userDomain) {
          this.userStore.setDefaultDomain(userDomain+this.$config.tldName);
          sessionStorage.setItem(String(this.address).toLowerCase(), userDomain+this.$config.tldName);
        } else {
          this.userStore.setDefaultDomain(null);
        }

        this.fetchChatTokenBalance();
      }
    },

    onWidthChange() {
      this.width = window.innerWidth;
    }
  },

  setup() {
    const config = useRuntimeConfig();
    const sidebarStore = useSidebarStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const { address, chainId, isActivated, signer } = useEthers();
    const { connectWith } = useWallet();

    //const localStorageConnected = useLocalStorage('connected', null); // when localStorageConnected.value is updated, localStorage is updated too

    const coinbaseConnector = new CoinbaseWalletConnector({
			appName: config.projectName,
			jsonRpcUrl: rpcs[String(config.supportedChainId)],
		});

		const mmConnector = new MetaMaskConnector({
			appUrl: config.projectUrl,
		});

    // wallet connect v2
		const wcConnector = new WalletConnectConnector({
			projectId: '91859bae408b0bdaafd117f09f21f0ec',
      chains: [80001],
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: undefined,
        chainImages: undefined,
        desktopWallets: undefined,
        walletImages: undefined,
        mobileWallets: undefined,
        enableExplorer: true,
        explorerAllowList: undefined,
        tokenImages: undefined,
        privacyPolicyUrl: undefined,
        explorerDenyList: undefined,
        termsOfServiceUrl: undefined,
      }
		});
    
    return { 
      address, chainId, coinbaseConnector, connectWith, isActivated, mmConnector, signer, 
      sidebarStore, siteStore, userStore, wcConnector 
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.fetchUserDomain();
      }
    },

    chainId(newVal, oldVal) {
      if (newVal) {
        this.fetchUserDomain();
      }
    },

    isActivated(newVal, oldVal) {
			if (oldVal === true && newVal === false) { // if user disconnects, clear the local storage
				localStorage.clear();
				sessionStorage.clear();
			} else {
        if (!this.userStore.getDid) {
          this.getOrbisDids();
        }

        this.fetchOrbisProfile();
      }
		},

    width(newVal, oldVal) {
      if (newVal > this.breakpoint) {
        this.lSidebar.show();
        this.rSidebar.show();
        this.sidebarStore.setLeftSidebar(true);
        this.sidebarStore.setMainContent(true);
        this.sidebarStore.setRightSidebar(true);
      } else {
        this.lSidebar.hide();
        this.rSidebar.hide();
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
        this.sidebarStore.setRightSidebar(false);
      }
    },
  }
}
</script>