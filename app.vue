<template>
  <Head>
    <Title>{{ $config.public.projectMetadataTitle }}</Title>
    <Meta name="description" :content="$config.public.projectDescription" />
    <Link rel="icon" type="image/x-icon" :href="$config.public.favicon" />

    <Meta property="og:title" :content="$config.public.projectMetadataTitle" />
    <Meta property="og:description" :content="$config.public.projectDescription" />
    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImage" />

    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:site" :content="$config.public.projectTwitter" />
    <Meta name="twitter:creator" :content="$config.public.projectTwitter" />
    <Meta name="twitter:title" :content="$config.public.projectMetadataTitle" />
    <Meta name="twitter:description" :content="$config.public.projectDescription" />
    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImage" />
    
    <Meta name="fc:miniapp" :content="farcasterMetaContent" />
  </Head>

  <NavbarDesktop v-if="!isMobile" />
  <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

  <!-- Main content with sidebars -->
  <div class="container-fluid page-container">
    <div class="row flex-nowrap">
      <SidebarLeft :lSidebar="lSidebar" :isMobile="isMobile" />

      <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="mainContent">
        <NuxtPage />
      </main>

      <SidebarRight :rSidebar="rSidebar" :isMobile="isMobile" />
    </div>
  </div>

  <SiteSettingsModal />
  <ChangeUsernameModal />
  <ReferralModal />

</template>

<script>
import { sdk } from '@farcaster/miniapp-sdk'
import farcasterConfig from '@/public/.well-known/farcaster.json'
import SiteSettingsModal from '@/components/SiteSettingsModal.vue'
import ChangeUsernameModal from '@/components/names/ChangeUsernameModal.vue'
import NavbarDesktop from '@/components/navbars/NavbarDesktop.vue'
import NavbarMobile from '@/components/navbars/NavbarMobile.vue'
import ReferralModal from '@/components/referrals/ReferralModal.vue'
import SidebarLeft from '@/components/sidebars/SidebarLeft.vue'
import SidebarRight from '@/components/sidebars/SidebarRight.vue'
import { useSidebars } from '@/composables/useSidebars'
import { useSiteSettings } from '@/composables/useSiteSettings'
import { useAccountData } from '@/composables/useAccountData'
import { useWeb3 } from '@/composables/useWeb3'
import { getActivityPoints, getArweaveBalance, getTokenBalanceWei } from '@/utils/balanceUtils'
import { getDomainName } from '@/utils/domainUtils'
import { parseReferrer } from '@/utils/referrerUtils'

export default {
  data() {
    return {
      apAlreadyFetchedForAddress: null,
      breakpoint: 1000,
      chatTokenBalanceAlreadyFetchedForAddress: null,
      isMounted: false,
      lSidebar: null,
      referrer: null,
      rSidebar: null,
      width: null,
    }
  },

  components: {
    ChangeUsernameModal,
    NavbarDesktop,
    NavbarMobile,
    ReferralModal,
    SidebarLeft,
    SidebarRight,
    SiteSettingsModal,
  },

  async mounted() {
    this.isMounted = true

    // set color mode
    document.documentElement.setAttribute('data-bs-theme', this.colorMode)

    // set sidebar collapse
    this.lSidebar = new bootstrap.Collapse('#sidebar1', { toggle: false })
    this.rSidebar = new bootstrap.Collapse('#sidebar2', { toggle: false })
    this.width = window.innerWidth

    if (this.width < this.breakpoint) {
      this.setLeftSidebar(false)
      this.setRightSidebar(false)
      this.lSidebar.hide()
      this.rSidebar.hide()
    } else {
      this.lSidebar.show()
      //this.rSidebar.show();
      this.setLeftSidebar(true)
      this.setRightSidebar(true)
    }

    window.addEventListener('resize', this.onWidthChange)

    // initialize Farcaster SDK
    sdk.actions.ready()

    // detect if running in Farcaster environment and connect to Farcaster wallet if so
    this.isFarcaster = await sdk.isInMiniApp()

    if (this.isFarcaster) {
      this.setEnvironment('farcaster')

      // Connect to Farcaster wallet
      this.connect({ connector: this.connectors[1], chainId: this.chainId })
    }

    // enable popovers everywhere
    new bootstrap.Popover(document.body, {
      selector: "[data-bs-toggle='popover']",
    })

    // fetch Arweave balance
    this.fetchArweaveBalance()

    // check if file upload is enabled
    this.setFileUploadEnabled(this.$config.public.fileUploadEnabled)

    // check if referrer in the URL
    this.referrer = this.$route.query.ref
    if (this.referrer) {
      parseReferrer(this.referrer, this.address, window)
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
    
    farcasterMetaContent() {
      return JSON.stringify({
        version: farcasterConfig.miniapp.version,
        imageUrl: farcasterConfig.miniapp.imageUrl,
        button: {
          title: farcasterConfig.miniapp.buttonTitle,
          action: {
            type: 'launch_miniapp',
            name: farcasterConfig.miniapp.name,
            url: farcasterConfig.miniapp.homeUrl,
            splashImageUrl: farcasterConfig.miniapp.splashImageUrl,
            splashBackgroundColor: farcasterConfig.miniapp.splashBackgroundColor
          }
        }
      })
    }
  },

  methods: {
    onWidthChange() {
      this.width = window.innerWidth
    },

    async fetchActivityPoints() {
      if (this.$config.public.activityPointsAddress) {
        const activityPoints = await getActivityPoints(this.address)
        this.setCurrentUserActivityPoints(activityPoints)
      }
    },

    async fetchArweaveBalance() {
      if (this.$config.public.arweaveAddress) {
        const balance = await getArweaveBalance(this.$config.public.arweaveAddress)
        console.log('Arweave balance:', balance)

        this.setArweaveBalance(balance)
      }
    },

    async fetchChatTokenBalance() {
      if (this.$config.public.chatTokenAddress) {
        
        const chatToken = {
          address: this.$config.public.chatTokenAddress,
          decimals: 18 // Chat token has 18 decimals as defined in tokens.json
        }
        
        const balance = await getTokenBalanceWei(chatToken, this.address)

        this.setChatTokenBalanceWei(balance)
      }
    },
  },

  setup() {
    
    const { 
      address, chainId, connect, connectors, domainName, isActivated, 
      setCurrentUserActivityPoints, setDomainName, setChatTokenBalanceWei } = useAccountData()

    const { mainContent, setLeftSidebar, setRightSidebar, setMainContent } = useSidebars()
    const { colorMode, setArweaveBalance, setFileUploadEnabled } = useSiteSettings()

    const { setEnvironment } = useWeb3()
    
    return {
      address,
      chainId,
      colorMode,
      connect,
      connectors,
      domainName,
      isActivated,
      mainContent,
      setArweaveBalance,
      setChatTokenBalanceWei,
      setCurrentUserActivityPoints,
      setDomainName,
      setEnvironment,
      setFileUploadEnabled,
      setLeftSidebar,
      setMainContent,
      setRightSidebar,
    }
  },

  watch: {
    width(newVal, oldVal) {
      if (newVal > this.breakpoint) {
        this.lSidebar.show()
        this.rSidebar.show()
        this.setLeftSidebar(true)
        this.setMainContent(true)
        this.setRightSidebar(true)
      } else {
        this.lSidebar.hide()
        this.rSidebar.hide()
        this.setLeftSidebar(false)
        this.setMainContent(true)
        this.setRightSidebar(false)
      }
    },
    
    // Watch for address changes to fetch domain name
    async address(newAddress, oldAddress) {
      if (newAddress && newAddress !== oldAddress) {
        const domain = await getDomainName(newAddress, window)
        this.setDomainName(domain)

        if (!this.apAlreadyFetchedForAddress || this.apAlreadyFetchedForAddress !== newAddress) {
          this.fetchActivityPoints()
          this.apAlreadyFetchedForAddress = newAddress
        }

        if (!this.chatTokenBalanceAlreadyFetchedForAddress || this.chatTokenBalanceAlreadyFetchedForAddress !== newAddress) {
          this.fetchChatTokenBalance()
          this.chatTokenBalanceAlreadyFetchedForAddress = newAddress
        }
      }
    },
    
    async chainId(newChainId) {
      if (newChainId && this.address) {
        const domain = await getDomainName(this.address, window)
        this.setDomainName(domain)
      }
    },

    async isActivated(newIsActivated) {
      if (newIsActivated && this.address) {
        const domain = await getDomainName(this.address, window)
        this.setDomainName(domain)

        if (!this.apAlreadyFetchedForAddress || this.apAlreadyFetchedForAddress !== this.address) {
          this.fetchActivityPoints()
          this.apAlreadyFetchedForAddress = this.address
        }

        if (!this.chatTokenBalanceAlreadyFetchedForAddress || this.chatTokenBalanceAlreadyFetchedForAddress !== this.address) {
          this.fetchChatTokenBalance()
          this.chatTokenBalanceAlreadyFetchedForAddress = this.address
        }
      }
    },
  },

}
</script>
