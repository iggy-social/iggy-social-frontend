<template>
  <div>
    <!-- Button -->
    <button
      v-if="!navbar && !dropdown"
      class="btn btn-primary"
      @click="switchToChain(this.getSupportedChainData.id)"
    >
      Switch to {{ this.getSupportedChainData.name }}
    </button>

    <!-- Button with dropdown -->
    <div v-if="!navbar && dropdown" class="dropdown">
      <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ showChainName }}
      </button>
      <div class="dropdown-menu">
        <span class="dropdown-item cursor-pointer" @click="switchToChain(this.getSupportedChainData.id)">
          Switch to {{ this.getSupportedChainData.name }}
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
        <span class="dropdown-item cursor-pointer" @click="switchToChain(this.getSupportedChainData.id)">
          Switch to {{ this.getSupportedChainData.name }}
        </span>
      </div>
    </li>
  </div>
</template>

<script>
import { switchChain } from '@wagmi/core'
import { useAccount, useConfig } from '@wagmi/vue'

export default {
  name: 'SwitchChainButton',
  props: ['dropdown', 'navbar'],

  computed: {
    isSupportedChain() {
      if (this.chainId === this.$config.public.supportedChainId) {
        return true
      } else {
        return false
      }
    },
    
    showChainName() {
      if (this.isSupportedChain) {
        return this.getSupportedChainData.name
      } else {
        return 'Unsupported network'
      }
    },
  },

  methods: {
    async switchToChain(chainId) {
      try {
        await this.switchChain(this.wagmiConfig, { chainId })
      } catch (error) {
        console.error('Failed to switch network:', error)
      }
    },
  },

  setup() {
    const config = useConfig()
    const { chainId } = useAccount({ config })

    return {
      chainId,
      wagmiConfig: config,
      getSupportedChainData: config.chains[0],
      switchChain,
    }
  },
}
</script>
