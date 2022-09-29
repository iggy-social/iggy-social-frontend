<template>
  <div>
    <Head>
      <Title>Punk Starter Template</Title>
      <Meta name="description" content="Punk Starter template with Nuxt 3 and Vue Dapp" />
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

export default {
  methods: {
    async fetchUserDomain() {
      const contract = new ethers.Contract(resolvers[this.chainId], ResolverAbi, this.signer);

      // get user's default domain
      const userDomain = await contract.getDefaultDomain(this.address, this.$tldName);

      if (userDomain) {
        this.userStore.setDefaultDomain(userDomain+this.$tldName);
        sessionStorage.setItem(String(this.address).toLowerCase(), userDomain+this.$tldName);
      } else {
        this.userStore.setDefaultDomain(null);
      }
    }
  },

  setup() {
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const { address, chainId, isActivated, signer } = useEthers();
    const { connectWith, wallet } = useWallet();
    const connectedType = useLocalStorage('connected', null); // when connectedType.value is updated, localStorage is updated too

    const infuraId = ''

    const connectors = [
      new MetaMaskConnector({
        appUrl: 'http://localhost:3000',
      }),
      new WalletConnectConnector({
        qrcode: true,
        rpc: {
          1: `https://mainnet.infura.io/v3/${infuraId}`,
          4: `https://rinkeby.infura.io/v3/${infuraId}`,
        },
      }),
      new CoinbaseWalletConnector({
        appName: 'Vue Dapp',
        jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraId}`,
      }),
    ]

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && connectedType.value == "metamask") {
        const connector = new MetaMaskConnector();
        connectWith(connector);
      }
    })

    watch(isActivated, (newValue, oldValue) => {
      if (newValue) {
        connectedType.value = String(wallet.connector.name).toLowerCase(); // "connected" value in localStorage updated
      } else {
        connectedType.value = null; // "connected" value in localStorage deleted
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