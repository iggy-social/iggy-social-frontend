<template>
  <div>
    <!-- Button -->
    <button
      v-if="!navbar && !dropdown"
      class="btn btn-primary"
      @click="switchToChain(this.getSupportedChainData().id)"
    >
      Switch to {{ this.getSupportedChainData().name }}
    </button>

    <!-- Button with dropdown -->
    <div v-if="!navbar && dropdown" class="dropdown">
      <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ showChainName }}
      </button>
      <div class="dropdown-menu">
        <span class="dropdown-item cursor-pointer" @click="switchToChain(this.getSupportedChainData().id)">
          Switch to {{ this.getSupportedChainData().name }}
        </span>
      </div>
    </div>

    <!-- Navbar link with dropdown -->
    <li v-if="navbar && dropdown" class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        data-bs-toggle="dropdown"
        href="#"
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {{ showChainName }}
      </a>
      <div class="dropdown-menu dropdown-menu-end">
        <span class="dropdown-item cursor-pointer" @click="switchToChain(this.getSupportedChainData().id)">
          Switch to {{ this.getSupportedChainData().name }}
        </span>
      </div>
    </li>
  </div>
</template>

<script>
import { useAccountData } from '@/composables/useAccountData'

export default {
  name: 'SwitchChainButton',
  props: ['dropdown', 'navbar'],

  computed: {
    showChainName() {
      if (this.isCurrentChainSupported) {
        return this.getSupportedChainData().name
      } else {
        return 'Unsupported network'
      }
    },
  },

  methods: {
    async switchToChain(chainId) {
      try {
        await this.switchToNetwork(chainId)
      } catch (error) {
        console.error('Failed to switch network:', error)
      }
    },
  },

  setup() {
    const { 
      chainId, 
      getSupportedChainData, 
      isCurrentChainSupported, 
      switchToNetwork 
    } = useAccountData()

    return {
      chainId,
      getSupportedChainData,
      isCurrentChainSupported,
      switchToNetwork,
    }
  },
}
</script>
