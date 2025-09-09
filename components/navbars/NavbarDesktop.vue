<template>
  <nav class="navbar navbar-expand-lg navbar-bg-custom">
    <div class="container-fluid mx-3">
      <NuxtLink class="navbar-brand" to="/">
        <img src="/img/logo.svg" alt="Iggy Social logo" height="45" />
      </NuxtLink>

      <ul class="navbar-nav justify-content-end flex-grow-1">
        <li v-if="isActivated" class="nav-item">
          <span class="nav-link cursor-pointer" data-bs-toggle="modal" data-bs-target="#referralModal">
            Earn referral fees! 🤑
          </span>
        </li>

        <li v-if="!isActivated" class="nav-item">
          <ConnectWalletButton customClass="nav-link cursor-pointer btn-primary" />
        </li>

        <li v-if="isActivated" class="nav-item">
          <SwitchChainButton dropdown="true" navbar="true" />
        </li>

        <li v-if="isActivated" class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {{ showDomainOrAddress }}
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <NuxtLink class="dropdown-item cursor-pointer" :to="getProfileLink">Profile</NuxtLink>
            
            <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#siteSettingsModal">
              Settings
            </span>
            <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#changeUsernameModal">
              Change username
            </span>
            <NuxtLink class="dropdown-item cursor-pointer" to="/find-user">
              Find user
            </NuxtLink>
            <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#referralModal">
              Share referral link
            </span>
            <span class="dropdown-item cursor-pointer" @click="disconnectWallet">Disconnect</span>
          </div>
        </li>

        <li class="nav-item cursor-pointer" title="Toggle between light and dark mode">
          <span class="nav-link" v-if="colorMode === 'dark'" @click="changeColorMode('light')" style="cursor: pointer;">
            <i class="bi bi-brightness-high"></i>
          </span>

          <span class="nav-link" v-if="colorMode === 'light'" @click="changeColorMode('dark')" style="cursor: pointer;">
            <i class="bi bi-moon-fill"></i>
          </span>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import ConnectWalletButton from '@/components/connect/ConnectWalletButton.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import { addTokenToMetaMask } from '@/utils/tokenUtils'
import { useAccountData } from '@/composables/useAccountData'
import { useSiteSettings } from '@/composables/useSiteSettings'

export default {
  name: 'NavbarDesktop',

  components: {
    ConnectWalletButton,
    SwitchChainButton,
  },

  data() {
    return {
      userTokenBalance: '0', // This would need to be implemented based on your token contract
    }
  },

  mounted() {
    // Set initial theme
    document.documentElement.setAttribute('data-bs-theme', this.colorMode)
  },

  computed: {
    getProfileLink() {
      if (this.domainName) {
        return `/profile/?id=${this.domainName}`;
      } else if (this.address) {
        return `/profile/?id=${this.address}`;
      } else {
        return `/profile`;
      }
    },

    isActivated() {
      return this?.isActivated || false
    },

    showDomainOrAddress() {
      if (this.domainName) {
        return this.domainName
      } else if (this.address) {
        return this.addressShort
      }
      return 'Profile'
    },
  },

  methods: {
    addToMetaMask() {
      if (typeof window !== 'undefined' && window.ethereum) {
        addTokenToMetaMask(
          window.ethereum,
          this.$config.public.chatTokenAddress,
          this.$config.public.chatTokenSymbol,
          18, // decimals
          this.$config.public.chatTokenImage,
        )
      }
    },

    changeColorMode(newMode) {
      console.log('changeColorMode called with:', newMode)
      this.setColorMode(newMode)
      console.log('colorMode after setColorMode:', this.colorMode)
      document.documentElement.setAttribute('data-bs-theme', this.colorMode)
      console.log('data-bs-theme set to:', this.colorMode)
    },

    async disconnectWallet() {
      try {
        await this.disconnect()
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
      }
    },
  },

  setup() {

    const { 
      address,
      addressShort, 
      disconnect,
      domainName,
      isActivated, 
    } = useAccountData()

    const { colorMode, setColorMode } = useSiteSettings()

    return {
      address,
      addressShort,
      colorMode,
      disconnect,
      domainName,
      isActivated,
      setColorMode,
    }
  },
}
</script>
