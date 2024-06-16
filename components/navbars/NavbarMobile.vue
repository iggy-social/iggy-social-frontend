<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-mobile">
    <div class="container-fluid">
      <button @click="toggleLeftSidebar" class="nav-item btn navbar-toggler nav-btn-left" type="button">
        <span v-if="!sidebarStore.showLeftSidebar" class="navbar-toggler-icon"></span>
        <span v-if="sidebarStore.showLeftSidebar" class="bi bi-x-lg"></span>
      </button>

      <NuxtLink class="navbar-brand mx-auto" to="/">
        <img src="/img/logo.svg" alt="Chat logo" height="40" />
      </NuxtLink>

      <button @click="toggleRightSidebar" class="nav-item btn navbar-toggler nav-btn-right" type="button">
        <span v-if="!sidebarStore.showRightSidebar" class="navbar-toggler-icon"></span>
        <span v-if="sidebarStore.showRightSidebar" class="bi bi-x-lg"></span>
      </button>
    </div>
  </nav>

  <div v-if="!isSupportedChain || !isActivated" class="card border m-3">
    <div class="card-body d-flex justify-content-center">
      <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
      <SwitchChainButton v-if="isActivated && !isSupportedChain" />
    </div>
  </div>
</template>

<script>
import { useEthers } from '~/store/ethers'
import { useSidebarStore } from '~/store/sidebars'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'

export default {
  name: 'NavbarMobile',
  props: ['lSidebar', 'rSidebar'],

  components: {
    ConnectWalletButton,
    SwitchChainButton,
  },

  computed: {
    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    toggleLeftSidebar() {
      this.sidebarStore.setRightSidebar(false)
      //this.rSidebar.hide();

      if (this.sidebarStore.showLeftSidebar) {
        this.sidebarStore.setLeftSidebar(false)
        this.lSidebar.hide()
        this.sidebarStore.setMainContent(true)
      } else {
        this.sidebarStore.setLeftSidebar(true)
        this.lSidebar.show()
        this.sidebarStore.setMainContent(false)
      }
    },

    toggleRightSidebar() {
      this.lSidebar.hide()
      this.sidebarStore.setLeftSidebar(false)

      if (this.sidebarStore.showRightSidebar) {
        this.sidebarStore.setRightSidebar(false)
        //this.rSidebar.hide();
        this.sidebarStore.setMainContent(true)
      } else {
        this.sidebarStore.setRightSidebar(true)
        //this.rSidebar.show();
        this.sidebarStore.setMainContent(false)
      }
    },
  },

  setup() {
    const { chainId, isActivated } = useEthers()
    const sidebarStore = useSidebarStore()
    return { chainId, isActivated, sidebarStore }
  },
}
</script>
