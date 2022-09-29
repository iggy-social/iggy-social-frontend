<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter ({{$tldName}})</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="offcanvas offcanvas-end text-bg-primary" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header">
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body" >
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">

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
              <div class="dropdown-menu dropdown-menu-primary">
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Ethereum')">Ethereum</span>
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Arbitrum')">Arbitrum</span>
                <span class="dropdown-item cursor-pointer" @click="changeNetwork('Optimism')">Optimism</span>
              </div>
            </li>

            <li v-if="isActivated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                {{showDomainOrAddress}}
              </a>
              <div class="dropdown-menu dropdown-menu-primary">
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
import { useBoard, useEthers, useWallet, shortenAddress } from 'vue-dapp'
import { useSiteStore } from '~/store/site'
import { useUserStore } from '~/store/user'

export default {
  name: "Navbar",

  computed: {
    showDomainOrAddress() {
      if (this.userStore.getDefaultDomain) {
        return this.userStore.getDefaultDomain;
      } else if (this.address) {
        return this.shortenAddress(this.address);
      }

      return "Profile"
    }
  },

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
    const userStore = useUserStore();

    return { address, chainId, disconnect, isActivated, open, shortenAddress, siteStore, userStore }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>