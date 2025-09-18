<template>
  <div>
    <button class="btn" :class="customClass" @click="openModal" :disabled="isWalletConnecting">
      <span v-if="!isWalletConnecting">{{ btnText }}</span>
      <span v-else>
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        <span>Connecting...</span>
      </span>
    </button>

    <!-- Connect Wallet modal -->
    <div
      class="modal modal-sm fade"
      id="connectModal"
      aria-labelledby="connectModalLabel"
      :aria-hidden="!isModalOpen"
      :class="{ show: isModalOpen }"
      v-show="isModalOpen"
      @click="closeModal"
    >
      <div class="modal-dialog" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Connect your wallet</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
              aria-label="Close"
              id="closeConnectModal"
            >
              <span aria-hidden="true"></span>
            </button>
          </div>
          <div class="modal-body row">

            <!-- Farcaster wallet - only show in Farcaster environment -->
            <div 
              v-if="environment === 'farcaster'"
              class="card col-6 bg-transparent" 
              role="button" 
              @click.stop="connectFarcaster"
            >
              <img
                src="/img/wallets/farcaster.png"
                class="card-img-top card-img-wallet"
                alt="Farcaster"
              />
              <small class="text-center mb-3 text-muted">Farcaster</small>
            </div>

            <div v-if="environment !== 'farcaster'" class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
              <img
                src="/img/wallets/rabby.png"
                class="card-img-top card-img-wallet"
                alt="Rabby"
              />
              <small class="text-center mb-3 text-muted">Rabby</small>
            </div>

            <div v-if="environment !== 'farcaster'" class="card col-6 bg-transparent" role="button" @click.stop="connectWalletConnect">
              <img
                src="/img/wallets/wc.png"
                class="card-img-top card-img-wallet"
                alt="WalletConnect"
              />
              <small class="text-center mb-3 text-muted">WalletConnect</small>
            </div>

            <div v-if="environment !== 'farcaster'" class="card col-6 bg-transparent" role="button" @click.stop="connectMetaMask">
              <img
                src="/img/wallets/metamask.png"
                class="card-img-top card-img-wallet"
                alt="MetaMask"
              />
              <small class="text-center mb-3 text-muted">MetaMask</small>
            </div>

            <div v-if="environment !== 'farcaster'" class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
              <img
                src="/img/wallets/rainbow.png"
                class="card-img-top card-img-wallet"
                alt="Rainbow"
              />
              <small class="text-center mb-3 text-muted">Rainbow</small>
            </div>

            <!-- Bifrost wallet - hide in Farcaster environment -->
            <div 
              v-if="environment !== 'farcaster'"
              class="card col-6 bg-transparent" 
              role="button" 
              @click.stop="connectInjected"
            >
              <img
                src="/img/wallets/bifrost.png"
                class="card-img-top card-img-wallet"
                alt="Bifrost"
              />
              <small class="text-center mb-3 text-muted">Bifrost</small>
            </div>

            <div v-if="environment !== 'farcaster'" class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
              <img
                src="/img/wallets/brave.png"
                class="card-img-top card-img-wallet"
                alt="Brave"
              />
              <small class="text-center mb-3 text-muted">Brave</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END Connect Wallet modal -->
  </div>
</template>

<script>
import { useAccountData } from '@/composables/useAccountData'
import { useWeb3 } from '@/composables/useWeb3'

export default {
  name: 'ConnectWalletButton',
  props: {
    customClass: {
      type: String,
      default: null,
    },
    btnText: {
      type: String,
      default: 'Connect wallet',
    },
  },

  data() {
    return {
      breakpoint: 1000,
      isModalOpen: false,
    }
  },

  computed: {
    isWalletConnecting() {
      if (window.innerWidth < this.breakpoint) {
        return false
      } else if (this.connectionStatus) {
        return this.isConnecting
      } else {
        return false
      }
    },
  },

  methods: {

    closeModal() {
      this.isModalOpen = false
      document.body.classList.remove('modal-open')
    },

    async connectInjected() {
      try {
        this.connect({ connector: this.connectors[0], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect injected wallet:', error)
        console.error('Error details:', error.message, error.stack)
      }
    },

    async connectMetaMask() {
      try {
        this.connect({ connector: this.connectors[2], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect MetaMask wallet:', error)
        console.error('Error details:', error.message, error.stack)
      }
    },

    async connectWalletConnect() {
      try {
        this.connect({ connector: this.connectors[4], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect WalletConnect wallet:', error)
        console.error('Error details:', error.message, error.stack)
      }
    },

    async connectFarcaster() {
      try {
        await this.connect({ connector: this.connectors[1], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect Farcaster wallet:', error)
        console.error('Error details:', error.message, error.stack)
      }
    },

    openModal() {
      this.isModalOpen = true
      document.body.classList.add('modal-open')
    },
  },

  setup() {
    const { connect, connectors, chainId, connectionStatus, isConnecting } = useAccountData()
    const { environment } = useWeb3()

    return {
      connect,
      connectors,
      chainId,
      connectionStatus,
      environment,
      isConnecting,
    }
  },
}
</script>