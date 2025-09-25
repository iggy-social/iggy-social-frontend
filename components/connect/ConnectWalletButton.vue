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
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig, useDisconnect, useConnect } from '@wagmi/vue'
import { useSiteSettings } from '@/composables/useSiteSettings'

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
        await this.disconnectAsync()
        await this.connectAsync({ connector: this.injectedConnector, chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('[ConnectWalletButton] Failed to connect injected wallet:', error)
        console.error('[ConnectWalletButton] Error details:', error.message, error.stack)
      }
    },

    async connectMetaMask() {
      try {
        await this.disconnectAsync()
        await this.connectAsync({ connector: this.metaMaskConnector, chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('[ConnectWalletButton] Failed to connect MetaMask wallet:', error)
        console.error('[ConnectWalletButton] Error details:', error.message, error.stack)
      }
    },

    async connectWalletConnect() {
      try {
        await this.disconnectAsync()
        await this.connectAsync({ connector: this.walletConnectConnector, chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('[ConnectWalletButton] Failed to connect WalletConnect wallet:', error)
        console.error('[ConnectWalletButton] Error details:', error.message, error.stack)
      }
    },

    async connectFarcaster() {
      try {
        await this.disconnectAsync()
        await this.connectAsync({ connector: this.farcasterConnector, chainId: this.chainId })
        this.closeModal()
      } catch (error) {
        console.error('[ConnectWalletButton] Failed to connect Farcaster wallet:', error)
        console.error('[ConnectWalletButton] Error details:', error.message, error.stack)
      }
    },

    openModal() {
      this.isModalOpen = true
      document.body.classList.add('modal-open')
    },
  },

  setup() {
    const config = useConfig()
    const { chainId, isConnecting, status } = useAccount({ config })
    const { connectors } = useConnect()
    const { environment } = useSiteSettings()
    const toast = useToast()

    // CONNECTORS
    let injectedConnector;
    let metaMaskConnector;
    let walletConnectConnector;
    let farcasterConnector;

    for (const connector of connectors) {
      if (connector.name === 'Injected') {
        injectedConnector = connector
      } else if (connector.name === 'MetaMask') {
        metaMaskConnector = connector
      } else if (connector.name === 'WalletConnect') {
        walletConnectConnector = connector
      } else if (connector.name === 'Farcaster') {
        farcasterConnector = connector
      }
    }

    // DISCONNECT
    const { disconnectAsync } = useDisconnect({
      config,
      mutation: {
        onSuccess() {
          window.localStorage.setItem("connected-with", "")

          /*
          if (environment.value !== 'farcaster') {
            // needed to prevent wagmi's bug which sometimes happens ("ConnectorAlreadyConnectedError")
            //window.location.reload()
          }
          */
        },
      }
    })

    // CONNECT
    const { connectAsync } = useConnect({
      config,
      mutation: {
        onSuccess: (data, variables) => {
          // store to localstorage
          if (variables?.connector?.id) {
            window.localStorage.setItem("connected-with", variables.connector.id)
          }
          
        },
        onError: async (error) => {
          //toast("Error, please try connecting again.", { type: 'error' })
          console.error('Connection failed:', error)

          if (String(error).startsWith("ConnectorAlreadyConnectedError")) {
            console.log("INSIDE ConnectorAlreadyConnectedError")
            toast("ConnectorAlreadyConnectedError Error, please try connecting again.", { type: 'error' })
            await disconnectAsync()
            //window.location.reload()
          }
        }
      }
    })

    return {
      chainId,
      connectAsync,
      connectionStatus: status,
      disconnectAsync,
      environment,
      farcasterConnector,
      injectedConnector,
      isConnecting,
      metaMaskConnector,
      walletConnectConnector,
    }
  },
}
</script>