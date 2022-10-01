<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter ({{$config.tldName}})</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="offcanvas offcanvas-end text-bg-primary" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header">
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body" >
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">

            <li v-if="!isActivated" class="nav-item" data-bs-dismiss="offcanvas">
              <ConnectWalletButton class="nav-link cursor-pointer" btnText="Connect wallet" />
            </li>

            <li v-if="isActivated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                {{showDomainOrAddress}}
              </a>
              <div class="dropdown-menu dropdown-menu-primary">
                <span class="dropdown-item cursor-pointer" @click="disconnectWallet">Disconnect</span>
              </div>
            </li>

            <SwitchChainButton v-if="isActivated" :navbar="true" :dropdown="true" />

            <li class="nav-item" data-bs-dismiss="offcanvas">
              <NuxtLink class="nav-link" to="/profile">Profile page</NuxtLink>
            </li>

            <li class="nav-item" data-bs-dismiss="offcanvas">
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
import { useEthers, useWallet, shortenAddress } from 'vue-dapp';
import { useSiteStore } from '~/store/site';
import { useUserStore } from '~/store/user';
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import SwitchChainButton from "~/components/SwitchChainButton.vue";

export default {
  name: "Navbar",

  components: {
    ConnectWalletButton,
    SwitchChainButton
  },

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
    changeColorMode(newMode) {
      this.siteStore.setColorMode(newMode);
    },

    async disconnectWallet() {
      this.disconnect();
      await this.$orbis.logout();
    }
  },

  setup() {
    const { disconnect } = useWallet();
    const { address, isActivated } = useEthers();
    const siteStore = useSiteStore();
    const userStore = useUserStore();

    return { address, disconnect, isActivated, shortenAddress, siteStore, userStore }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>