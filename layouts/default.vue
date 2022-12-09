<template>
  <div>
    <Head>
      <Title>{{dotlessDomainName}} CHAT</Title>
      <Meta name="description" :content="'Chat for ' + $config.tldName + ' domain holders.'" />
      <Link rel="stylesheet" :href="'/css/'+siteStore.getColorMode" />
    </Head>

    <Navbar />

    <slot></slot>

    <vd-board :connectors="connectors" :dark="siteStore.getColorMode==='dark.css'" />
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useEthers, useWallet } from 'vue-dapp';
import { useSiteStore } from '~/store/site';
import { useUserStore } from '~/store/user';
import { useLocalStorage } from '@vueuse/core';
import ResolverAbi from "~/assets/abi/ResolverAbi.json";
import resolvers from "~/assets/resolvers.json";
import Navbar from "~/components/Navbar.vue";

export default {
  components: {
    Navbar
  },

  computed: {
    dotlessDomainName() {
      return String(this.$config.tldName).replace(".", "").toUpperCase();
    },
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
    }
  },

  setup() {
    const config = useRuntimeConfig()
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
    
    return { address, chainId, connectors, signer, siteStore, userStore }
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
  }
}
</script>