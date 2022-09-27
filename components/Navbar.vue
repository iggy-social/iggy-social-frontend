<template>
  <nav class="navbar navbar-expand-lg navbar-bg">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <div class="d-flex ms-auto" >
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item">
              <span class="nav-link active" v-if="siteStore.getColorMode === 'dark.css'" @click="changeColorMode('light.css')">Dark mode</span>
              <span class="nav-link active" v-if="siteStore.getColorMode === 'light.css'" @click="changeColorMode('dark.css')">Light mode</span>
            </li>

            <li class="nav-item">
              <NuxtLink class="nav-link active" aria-current="page" to="/">Home page</NuxtLink>
            </li>

            <li class="nav-item">
              <NuxtLink class="nav-link" to="/profile">Profile page</NuxtLink>
            </li>

            <div v-if="isActivated" class="btn-group mx-2 navbar-menu-btn dropdown-center">
              <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                {{ $getChainName(Number(chainId)) }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><button class="dropdown-item" @click="changeNetwork('Ethereum')">Ethereum</button></li>
                <li><button class="dropdown-item" @click="changeNetwork('Arbitrum')">Arbitrum</button></li>
                <li><button class="dropdown-item" @click="changeNetwork('Optimism')">Optimism</button></li>
              </ul>
            </div>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useBoard, useEthers } from 'vue-dapp'
import { useSiteStore } from '~/store/site'

export default {
  name: "Navbar",

  methods: {
    changeNetwork(networkName) {
      const networkData = this.$switchChain(networkName); 
      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    },

    changeColorMode(newMode) {
      this.siteStore.setColorMode(newMode);
    }
  },

  setup() {
    const { open } = useBoard()
    const { address, chainId, isActivated } = useEthers()
    const siteStore = useSiteStore();

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

    return { address, chainId, connectors, isActivated, open, siteStore }
  }
}
</script>