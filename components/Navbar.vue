<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <div class="d-flex ms-auto" >
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li v-if="isActivated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                {{ $getChainName(Number(chainId)) }}
              </a>
              <div class="dropdown-menu">
                <span class="dropdown-item" href="#" @click="changeNetwork('Ethereum')">Ethereum</span>
                <span class="dropdown-item" href="#" @click="changeNetwork('Arbitrum')">Arbitrum</span>
                <span class="dropdown-item" href="#" @click="changeNetwork('Optimism')">Optimism</span>
              </div>
            </li>

            <li class="nav-item">
              <span class="nav-link" v-if="siteStore.getColorMode === 'dark.css'" @click="changeColorMode('light.css')">Dark mode</span>
              <span class="nav-link" v-if="siteStore.getColorMode === 'light.css'" @click="changeColorMode('dark.css')">Light mode</span>
            </li>

            <li class="nav-item">
              <NuxtLink class="nav-link" aria-current="page" to="/">Home page</NuxtLink>
            </li>

            <li class="nav-item">
              <NuxtLink class="nav-link" to="/profile">Profile page</NuxtLink>
            </li>

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