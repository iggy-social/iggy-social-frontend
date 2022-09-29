<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter Template ({{$tldName}})</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <div class="d-flex ms-auto" >
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item">
              <NuxtLink class="nav-link" to="/profile">Profile page</NuxtLink>
            </li>

            <li v-if="!isActivated" class="nav-item" @click="open">
              <span class="nav-link cursor-pointer">Connect</span>
            </li>

            <li v-if="isActivated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                {{ $getChainName(Number(chainId)) }}
              </a>
              <div class="dropdown-menu">
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Ethereum')">Ethereum</span>
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Arbitrum')">Arbitrum</span>
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Optimism')">Optimism</span>
              </div>
            </li>

            <li v-if="isActivated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                Username
              </a>
              <div class="dropdown-menu">
                <span class="dropdown-item cursor-pointer" @click="disconnect">Disconnect</span>
              </div>
            </li>

            <li class="nav-item">
              <span class="nav-link" v-if="siteStore.getColorMode === 'dark.css'" @click="changeColorMode('light.css')">
                <i class="bi bi-brightness-high"></i>
              </span>

              <span class="nav-link" v-if="siteStore.getColorMode === 'light.css'" @click="changeColorMode('dark.css')">
                <i class="bi bi-moon-fill"></i>
              </span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useBoard, useEthers, useWallet } from 'vue-dapp'
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
    const { disconnect } = useWallet()
    const { address, chainId, isActivated } = useEthers()
    const siteStore = useSiteStore();

    return { address, chainId, disconnect, isActivated, open, siteStore }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>