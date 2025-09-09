<template>
  <div>
    <button class="btn" :class="customClass" @click="openModal" :disabled="isConnecting">
      <span v-if="!isConnecting">{{ btnText }}</span>
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
            <div class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
              <img
                src="/img/wallets/rabby.png"
                class="card-img-top card-img-wallet"
                alt="Rabby"
              />
              <small class="text-center mb-3 text-muted">Rabby</small>
            </div>

            <div class="card col-6 bg-transparent" role="button" @click.stop="connectWalletConnect">
              <img
                src="/img/wallets/wc.png"
                class="card-img-top card-img-wallet"
                alt="WalletConnect"
              />
              <small class="text-center mb-3 text-muted">WalletConnect</small>
            </div>

            <div class="card col-6 bg-transparent" role="button" @click.stop="connectMetaMask">
              <img
                src="/img/wallets/metamask.png"
                class="card-img-top card-img-wallet"
                alt="MetaMask"
              />
              <small class="text-center mb-3 text-muted">MetaMask</small>
            </div>

            <div class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
              <img
                src="/img/wallets/rainbow.png"
                class="card-img-top card-img-wallet"
                alt="Rainbow"
              />
              <small class="text-center mb-3 text-muted">Rainbow</small>
            </div>

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

            <div class="card col-6 bg-transparent" role="button" @click.stop="connectInjected">
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
      isModalOpen: false,
    }
  },

  methods: {
    openModal() {
      this.isModalOpen = true
      document.body.classList.add('modal-open')
    },

    closeModal() {
      this.isModalOpen = false
      document.body.classList.remove('modal-open')
    },

    async connectInjected() {
      try {
        await this.connect({ connector: this.connectors[0], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect injected wallet:', error)
        console.error('Error details:', error.message, error.stack)
      }
    },

    async connectMetaMask() {
      try {
        await this.connect({ connector: this.connectors[1], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect MetaMask:', error)
      }
    },

    async connectWalletConnect() {
      try {
        await this.connect({ connector: this.connectors[2], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect WalletConnect:', error)
      }
    },

    async connectFarcaster() {
      try {
        await this.connect({ connector: this.connectors[3], chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('Failed to connect Farcaster wallet:', error)
      }
    },
  },

  setup() {
    const { connect, connectors, chainId, isConnecting } = useAccountData()
    const { environment } = useWeb3()

    return {
      connect,
      connectors,
      chainId,
      environment,
      isConnecting,
    }
  },
}
</script>