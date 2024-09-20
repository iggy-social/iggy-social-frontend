<template>
  <Head>
    <Title>{{ $config.projectMetadataTitle }}</Title>
    <Meta name="description" :content="$config.projectDescription" />
    <Link rel="icon" type="image/x-icon" :href="$config.favicon" />

    <Meta property="og:title" :content="$config.projectMetadataTitle" />
    <Meta property="og:description" :content="$config.projectDescription" />
    <Meta property="og:image" :content="$config.projectUrl + $config.previewImage" />

    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:site" :content="$config.projectTwitter" />
    <Meta name="twitter:creator" :content="$config.projectTwitter" />
    <Meta name="twitter:title" :content="$config.projectMetadataTitle" />
    <Meta name="twitter:description" :content="$config.projectDescription" />
    <Meta name="twitter:image" :content="$config.projectUrl + $config.previewImage" />
  </Head>

  <NavbarDesktop v-if="!isMobile" />
  <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

  <!-- Main content with sidebars -->
  <div class="container-fluid page-container">
    <div class="row flex-nowrap">
      <SidebarLeft :lSidebar="lSidebar" :isMobile="isMobile" />

      <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="sidebarStore.showMainContent">
        <slot></slot>
      </main>

      <SidebarRight :rSidebar="rSidebar" :isMobile="isMobile" />
    </div>
  </div>

  <!-- Connect Wallet modal -->
  <VueDappModal :dark="siteStore.getColorMode === 'dark'" auto-connect auto-connect-browser-wallet-if-solo />

  <ChatSettingsModal />

  <ChangeUsernameModal />

  <FindUserModal />

  <ReferralModal />

  <!-- Do not delete: ugly hack to make "global" work with Vite -->
  <component :is="'script'"> var global = global || window; </component>
</template>

<script>
import { ethers } from 'ethers'
import { useSidebarStore } from '~/store/sidebars'
import { useSiteStore } from '~/store/site'
import { useUserStore } from '~/store/user'
import NavbarDesktop from '~/components/navbars/NavbarDesktop.vue'
import NavbarMobile from '~/components/navbars/NavbarMobile.vue'
import SidebarLeft from '~/components/sidebars/SidebarLeft.vue'
import SidebarRight from '~/components/sidebars/SidebarRight.vue'
import ChatSettingsModal from '~/components/ChatSettingsModal.vue'
import { getActivityPoints, getArweaveBalance } from '~/utils/balanceUtils'
import { getDomainHolder, getDomainName } from '~/utils/domainUtils'
import { storeReferrer, storeUsername } from '~/utils/storageUtils'
import ReferralModal from '~/components/referrals/ReferralModal.vue'
import ChangeUsernameModal from '~/components/names/ChangeUsernameModal.vue'
import FindUserModal from '~/components/search/FindUserModal.vue'
import { BrowserWalletConnector, RdnsEnum } from '@vue-dapp/core'
import { VueDappModal } from '@vue-dapp/modal'
import '@vue-dapp/modal/dist/style.css'
import { useEthers } from '~/store/ethers'

export default {
  data() {
    return {
      breakpoint: 1000,
      isMounted: false,
      lSidebar: null,
      referrer: null,
      rSidebar: null,
      width: null,
    }
  },

  components: {
    ChangeUsernameModal,
    ChatSettingsModal,
    FindUserModal,
    NavbarDesktop,
    NavbarMobile,
    ReferralModal,
    SidebarLeft,
    SidebarRight,
    VueDappModal,
  },

  mounted() {
    this.isMounted = true

    // set color mode
    document.documentElement.setAttribute('data-bs-theme', this.siteStore.getColorMode)

    // set sidebar collapse
    this.lSidebar = new bootstrap.Collapse('#sidebar1', { toggle: false })
    this.rSidebar = new bootstrap.Collapse('#sidebar2', { toggle: false })
    this.width = window.innerWidth

    if (this.width < this.breakpoint) {
      this.sidebarStore.setLeftSidebar(false)
      this.sidebarStore.setRightSidebar(false)
      this.lSidebar.hide()
      this.rSidebar.hide()
    } else {
      this.lSidebar.show()
      //this.rSidebar.show();
      this.sidebarStore.setLeftSidebar(true)
      this.sidebarStore.setRightSidebar(true)
    }

    window.addEventListener('resize', this.onWidthChange)

    // connect to wallet if user was connected before
    if (!this.isActivated) {
      if (localStorage.getItem('connected') == 'metamask') {
        this.connectMetaMask()
      } else if (localStorage.getItem('connected') == 'coinbase') {
        this.connectCoinbase()
      }
    }

    // enable popovers everywhere
    new bootstrap.Popover(document.body, {
      selector: "[data-bs-toggle='popover']",
    })

    // fetch Arweave balance
    this.fetchArweaveBalance()

    // check if file upload is enabled
    this.siteStore.setFileUploadEnabled(this.$config.fileUploadEnabled)

    // check if referrer in the URL
    this.referrer = this.$route.query.ref
    if (this.referrer) {
      this.parseReferrer()
    }
  },

  unmounted() {
    window.removeEventListener('resize', onWidthChange)
  },

  computed: {
    isMobile() {
      if (this.width < this.breakpoint) {
        return true
      }
      return false
    },
  },

  methods: {
    getActivityPoints,
    getDomainHolder,
    getDomainName, // imported function from utils/domainUtils.js

    async connectCoinbase() {
      await this.connectTo('BrowserWallet', {
        target: 'rdns',
        rdns: RdnsEnum.coinbase,
      })
      localStorage.setItem('connected', 'coinbase') // store in local storage to autoconnect next time
      document.getElementById('closeConnectModal').click()
    },

    async connectMetaMask() {
      await this.connectTo('BrowserWallet', {
        target: 'rdns',
        rdns: RdnsEnum.metamask,
      })
      localStorage.setItem('connected', 'metamask') // store in local storage to autoconnect next time
      document.getElementById('closeConnectModal').click()
    },

    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress) {
        const activityPoints = await this.getActivityPoints(this.address, this.signer)

        this.userStore.setCurrentUserActivityPoints(activityPoints)
      }
    },

    async fetchArweaveBalance() {
      if (this.$config.arweaveAddress) {
        const balance = await getArweaveBalance(this.$config.arweaveAddress)
        //console.log('Arweave balance:', balance)

        this.siteStore.setArweaveBalance(balance)
      }
    },

    // async fetchChatTokenBalance() {
    // 	if (this.$config.chatTokenAddress) {
    // 		const chatTokenInterface = new ethers.utils.Interface([
    // 			'function balanceOf(address owner) view returns (uint256)',
    // 		])

    // 		const chatTokenContract = new ethers.Contract(
    // 			this.$config.chatTokenAddress,
    // 			chatTokenInterface,
    // 			this.signer,
    // 		)

    // 		const balance = await chatTokenContract.balanceOf(this.address)

    // 		this.userStore.setChatTokenBalanceWei(balance)
    // 	}
    // },

    // async fetchUserDomain() {
    // 	if (
    // 		this.chainId === this.$config.supportedChainId &&
    // 		this.address != this.userStore.getCurrentUserAddress
    // 	) {
    // 		this.userStore.setCurrentUserAddress(this.address)

    // 		let userDomain

    // 		if (this.signer) {
    // 			userDomain = await this.getDomainName(this.address, this.signer)
    // 		} else {
    //      const provider = this.$getFallbackProvider(this.$config.supportedChainId)
    // 			userDomain = await this.getDomainName(this.address, provider)
    // 		}

    // 		if (userDomain) {
    // 			this.userStore.setDefaultDomain(userDomain + this.$config.tldName)
    // 			storeUsername(window, this.address, userDomain + this.$config.tldName)
    // 		} else {
    // 			this.userStore.setDefaultDomain(null)
    // 		}

    // 		this.fetchActivityPoints()
    // 		this.fetchChatTokenBalance()
    // 	}
    // },

    onWidthChange() {
      this.width = window.innerWidth
    },

    async parseReferrer() {
      // check if referrer is a domain name
      if (!this.referrer.startsWith('0x')) {
        let domainName = this.referrer

        if (this.referrer.includes(this.$config.tldName)) {
          // get the domain name without extension
          domainName = this.referrer.split('.')[0]
        }

        // fetch the domain holder address
        const provider = this.$getFallbackProvider(this.$config.supportedChainId)
        this.referrer = await this.getDomainHolder(domainName, provider)
      }

      if (this.address) {
        if (String(this.address).toLowerCase() === String(this.referrer).toLowerCase()) {
          return // cannot refer yourself
        }
      }

      // check if referrer is a valid address and not a zero address
      if (ethers.utils.isAddress(this.referrer) && this.referrer != ethers.constants.AddressZero) {
        // store into local storage as referrer
        storeReferrer(window, this.referrer)
      }
    },
  },

  setup() {
    const config = useRuntimeConfig()
    const sidebarStore = useSidebarStore()
    const siteStore = useSiteStore()
    const userStore = useUserStore()
    const {
      address,
      chainId,
      isActivated,
      signer,
      setWallet,
      resetWallet,
      addConnectors,
      connectTo,
      watchWalletChanged,
      watchDisconnect,
      watchAddressChanged,
      fetchBalance,
    } = useEthers()

    if (process.client) {
      addConnectors([new BrowserWalletConnector()])
    }

    const { $config, $getFallbackProvider } = useNuxtApp()

    watchWalletChanged(async wallet => {
      setWallet(wallet.provider)
      await fetchBalance()

      fetchUserDomain()
    })

    watchDisconnect(() => {
      resetWallet()

      // if user disconnects, clear the local storage
      console.log('user disconnected')
      localStorage.setItem('connected', '')
    })

    async function fetchUserDomain() {
      if (chainId.value === $config.supportedChainId && address.value != userStore.getCurrentUserAddress) {
        userStore.setCurrentUserAddress(address.value)

        let userDomain

        if (signer.value) {
          userDomain = await getDomainName(address.value, signer.value)
        } else {
          const provider = $getFallbackProvider($config.supportedChainId)
          userDomain = await getDomainName(address.value, provider)
        }

        if (userDomain) {
          userStore.setDefaultDomain(userDomain + $config.tldName)
          storeUsername(window, address.value, userDomain + $config.tldName)
        } else {
          userStore.setDefaultDomain(null)
        }

        fetchActivityPoints()
        fetchChatTokenBalance()
      }
    }

    async function fetchActivityPoints() {
      if ($config.activityPointsAddress) {
        const activityPoints = await getActivityPoints(address.value, signer.value)

        userStore.setCurrentUserActivityPoints(activityPoints)
      }
    }

    async function fetchChatTokenBalance() {
      if ($config.chatTokenAddress) {
        const chatTokenInterface = new ethers.utils.Interface([
          'function balanceOf(address owner) view returns (uint256)',
        ])

        const chatTokenContract = new ethers.Contract($config.chatTokenAddress, chatTokenInterface, signer.value)

        const balance = await chatTokenContract.balanceOf(address.value)

        userStore.setChatTokenBalanceWei(balance)
      }
    }

    return {
      address,
      chainId,
      connectTo,
      isActivated,
      signer,
      sidebarStore,
      siteStore,
      userStore,
      fetchUserDomain,
      fetchActivityPoints,
      fetchChatTokenBalance,
    }
  },

  watch: {
    // address(newVal, oldVal) {
    // 	if (newVal) {
    // 		this.fetchUserDomain()
    // 	}
    // },

    // chainId(newVal, oldVal) {
    // 	if (newVal) {
    // 		this.fetchUserDomain()
    // 	}
    // },

    // isActivated(newVal, oldVal) {
    // 	if (oldVal === true && newVal === false) {
    // 		// if user disconnects, clear the local storage
    // 		console.log('user disconnected')
    // 		localStorage.setItem('connected', '')
    // 	}
    // },

    width(newVal, oldVal) {
      if (newVal > this.breakpoint) {
        this.lSidebar.show()
        this.rSidebar.show()
        this.sidebarStore.setLeftSidebar(true)
        this.sidebarStore.setMainContent(true)
        this.sidebarStore.setRightSidebar(true)
      } else {
        this.lSidebar.hide()
        this.rSidebar.hide()
        this.sidebarStore.setLeftSidebar(false)
        this.sidebarStore.setMainContent(true)
        this.sidebarStore.setRightSidebar(false)
      }
    },
  },
}
</script>
