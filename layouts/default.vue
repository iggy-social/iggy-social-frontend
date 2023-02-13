<template>
  <div>
    <Head>
      <Title>{{dotlessDomainName}} CHAT</Title>
      <Meta name="description" :content="'Chat for ' + $config.tldName + ' domain holders.'" />
      <Link rel="stylesheet" :href="'/css/'+siteStore.getColorMode" />
    </Head>

    <NavbarDesktop v-if="!isMobile" />
    <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

    <!-- Main content with sidebars -->
    <div class="container-fluid page-container">
      <div class="row flex-nowrap">

        <SidebarLeft />

        <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="sidebarStore.showMainContent">
          <slot></slot>
        </main>

        <SidebarRight />
        
      </div>
    </div>

    

    <vd-board :connectors="connectors" :dark="siteStore.getColorMode==='dark.css'" />
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
import { useLocalStorage } from '@vueuse/core';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/resolvers.json";
import NavbarDesktop from "~/components/navbars/NavbarDesktop.vue";
import NavbarMobile from "~/components/navbars/NavbarMobile.vue";
import SidebarLeft from "~/components/sidebars/SidebarLeft.vue";
import SidebarRight from "~/components/sidebars/SidebarRight.vue";

export default {
  data() {
    return {
      breakpoint: 1000,
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

  mounted() {
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
    dotlessDomainName() {
      return String(this.$config.tldName).replace(".", "").toUpperCase();
    },

    isMobile() {
      if (this.width < this.breakpoint) {
        return true;
      }
      return false;
    }
  },

  methods: {
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
      }
    },

    onWidthChange() {
      this.width = window.innerWidth;
    }
  },

  setup() {
    const config = useRuntimeConfig()
    const sidebarStore = useSidebarStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const { address, chainId, isActivated, signer } = useEthers();
    const { connectWith, wallet } = useWallet();

    const localStorageConnected = useLocalStorage('connected', null); // when localStorageConnected.value is updated, localStorage is updated too

    const connectors = [
      new MetaMaskConnector({
        appUrl: config.projectUrl,
      }),
      new WalletConnectConnector({
        qrcode: true,
        rpc: { // TODO: get values from nuxt.config.ts
          10: "https://1rpc.io/op", //`https://opt-mainnet.g.alchemy.com/v2/${config.alchemyOptimismKey}`,
          42161: "https://arb1.arbitrum.io/rpc", //`https://arb-mainnet.g.alchemy.com/v2/${config.alchemyArbitrumKey}`,
          1313161555: "https://testnet.aurora.dev"
        },
      }),
      new CoinbaseWalletConnector({ // TODO: get values from nuxt.config.ts
        appName: config.projectName,
        jsonRpcUrl: "https://testnet.aurora.dev",
      }),
    ]

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && localStorageConnected.value == "metamask") {
        const connector = new MetaMaskConnector();
        connectWith(connector);
      }
    })

    watch(isActivated, (newValue, oldValue) => {
      if (newValue) {
        localStorageConnected.value = String(wallet.connector.name).toLowerCase(); // "connected" value in localStorage updated
      } else {
        // if disconnected, delete local storage values
        localStorageConnected.value = null; // "connected" value in localStorage deleted
      }
    });
    
    return { address, chainId, connectors, signer, sidebarStore, siteStore, userStore }
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