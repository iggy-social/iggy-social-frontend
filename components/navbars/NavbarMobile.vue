<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-mobile">
    <div class="container-fluid">
      <button @click="toggleLeftSidebar" class="nav-item btn navbar-toggler nav-btn-left" type="button">
        <span v-if="!showLeftSidebar" class="navbar-toggler-icon"></span>
        <span v-if="showLeftSidebar" class="bi bi-x-lg"></span>
      </button>

      <NuxtLink class="navbar-brand mx-auto" to="/">
        <img src="/img/logo.svg" alt="Iggy Social logo" height="40" />
      </NuxtLink>

      <button @click="toggleRightSidebar" class="nav-item btn navbar-toggler nav-btn-right" type="button">
        <span v-if="!showRightSidebar" class="navbar-toggler-icon"></span>
        <span v-if="showRightSidebar" class="bi bi-x-lg"></span>
      </button>
    </div>
  </nav>

  <div v-if="!isSupportedChain || !isActivated" class="card border m-3">
    <div class="card-body d-flex justify-content-center">
      <ConnectWalletButton v-if="!isActivated" customClass="btn-primary" />
      <SwitchChainButton v-if="isActivated && !isSupportedChain" />
    </div>
  </div>
</template>

<script>
import ConnectWalletButton from '@/components/connect/ConnectWalletButton.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import { useAccountData } from '@/composables/useAccountData'
import { useSidebars } from '@/composables/useSidebars'

export default {
  name: 'NavbarMobile',
  props: ['lSidebar', 'rSidebar'],

  components: {
    ConnectWalletButton,
    SwitchChainButton,
  },

  computed: {
    isSupportedChain() {
      return this.chainId === this.$config.public.supportedChainId
    },

    isActivated() {
      return this.isActivated || false
    },

    chainId() {
      return this.chainId || 1
    },

    showLeftSidebar() {
      return this.leftSidebar
    },

    showRightSidebar() {
      return this.rightSidebar
    },
  },

  methods: {
    toggleLeftSidebar() {
      this.setRightSidebar(false)

      if (this.showLeftSidebar) {
        this.setLeftSidebar(false)
        if (this.lSidebar) this.lSidebar.hide()
        this.setMainContent(true)
      } else {
        this.setLeftSidebar(true)
        if (this.lSidebar) this.lSidebar.show()
        this.setMainContent(false)
      }
    },

    toggleRightSidebar() {
      if (this.lSidebar) this.lSidebar.hide()
      this.setLeftSidebar(false)

      if (this.showRightSidebar) {
        this.setRightSidebar(false)
        this.setMainContent(true)
      } else {
        this.setRightSidebar(true)
        this.setMainContent(false)
      }
    },

    async changeNetwork(chainId) {
      try {
        await this.switchToNetwork(chainId)
      } catch (error) {
        console.error('Failed to switch network:', error)
      }
    },
  },

  setup() {
    const { isActivated, chainId, switchToNetwork } = useAccountData()
    const { leftSidebar, rightSidebar, setLeftSidebar, setRightSidebar, setMainContent } = useSidebars()

    return {
      chainId,
      isActivated,
      leftSidebar,
      rightSidebar,
      setLeftSidebar,
      setRightSidebar,
      setMainContent,
      switchToNetwork,
    }
  },
}
</script>
