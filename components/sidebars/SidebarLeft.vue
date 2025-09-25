<template>
  <div class="col col-lg-auto px-0 mt-1">
    <div id="sidebar1" class="collapse collapse-horizontal" :class="this.sidebarLeftSticky ? 'sticky-lg-top' : ''">
      <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100">
        <div class="card m-2 p-2 bg-light">

          <!-- Profile Image and Data -->
          <div v-if="isConnected && domainName" class="text-center">
            <NuxtLink :to="getProfileLink">
              <ProfileImage
                :key="domainName"
                @click="closeLeftSidebar"
                class="img-fluid mt-3 rounded-circle w-30 sidebar-profile-image"
                :domain="domainName"
              />
            </NuxtLink>

            <h6 class="mt-3" v-if="domainName">
              {{ getTextWithoutBlankCharacters(domainName) }}
            </h6>

            <!-- Chat tokens -->
            <!--
            <button v-if="userStore.getChatTokenBalanceWei > 0 && $config.public.chatTokenAddress" class="btn btn-outline-primary btn-sm mt-2 mb-2 disabled">
              {{ userStore.getChatTokenBalance }} {{ $config.public.chatTokenSymbol }}
            </button>
            -->

            <!-- Activity Points -->
            <div v-if="$config.public.activityPointsAddress && $config.public.showFeatures.activityPoints" class="mt-2">
              <NuxtLink to="/activity-points" class="btn btn-outline-primary btn-sm mt-2 mb-2">
                {{ getUserAp }} AP
              </NuxtLink>
            </div>

            <hr />
          </div>

          <!-- Pills -->
          <ul class="nav nav-pills flex-column">

              <!-- Chat -->
              <ul class="list-group">
                <NuxtLink
                  to="/"
                  class="list-group-item cursor-pointer hover-color bg-light border-0"
                  :class="$route.path === '/' ? 'active' : ''"
                  @click="closeLeftSidebar"
                >
                  General discussion
                </NuxtLink>
              </ul>

              <ul class="list-group">
                <NuxtLink
                  to="/memes-images"
                  class="list-group-item cursor-pointer hover-color bg-light border-0"
                  :class="$route.path.startsWith('/memes-images') ? 'active' : ''"
                  @click="closeLeftSidebar"
                >
                  Share images & NFTs
                </NuxtLink>
              </ul>

              <ul class="list-group">
                <NuxtLink
                  to="/shill"
                  class="list-group-item cursor-pointer hover-color bg-light border-0"
                  :class="$route.path.startsWith('/shill') ? 'active' : ''"
                  @click="closeLeftSidebar"
                >
                  Shill & discuss projects
                </NuxtLink>
              </ul>

              <hr />

              <!-- NFT Launchpad -->
              <li
                class="nav-item p-1"
                @click="closeLeftSidebar"
                v-if="$config.public.nftLaunchpadBondingAddress && $config.public.showFeatures.nftLaunchpad"
              >
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/nft') ? 'active' : ''"
                  aria-current="page"
                  to="/nft"
                >
                  <i class="bi bi-rocket-takeoff me-2"></i> NFT Launchpad
                </NuxtLink>
              </li>

              <!-- Profile -->
              <li v-if="isConnected && domainName" class="nav-item p-1" @click="closeLeftSidebar">
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/profile') ? 'active' : ''"
                  aria-current="page"
                  :to="getProfileLink"
                >
                  <i class="bi bi-person me-2"></i> Profile
                </NuxtLink>
              </li>

              <!-- Activity Points -->
              <li
                class="nav-item p-1"
                @click="closeLeftSidebar"
                v-if="$config.public.showFeatures.activityPoints && $config.public.activityPointsAddress"
              >
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/activity-points') ? 'active' : ''"
                  aria-current="page"
                  to="/activity-points"
                >
                  <i class="bi bi-award me-2"></i> Activity Points
                </NuxtLink>
              </li>

              <!-- Send tokens -->
              <li class="nav-item p-1" @click="closeLeftSidebar" v-if="$config.public.showFeatures.sendTokens">
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/send-tokens') ? 'active' : ''"
                  aria-current="page"
                  to="/send-tokens"
                >
                  <i class="bi bi-send me-2"></i> Send Tokens
                </NuxtLink>
              </li>

              <!-- Stake & Earn -->
              <li
                class="nav-item p-1"
                @click="closeLeftSidebar"
                v-if="$config.public.stakingContractAddress && $config.public.showFeatures.stake"
              >
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/stake') ? 'active' : ''"
                  aria-current="page"
                  to="/stake"
                >
                  <i class="bi bi-cash-stack me-2"></i> Stake & Earn
                </NuxtLink>
              </li>

              <!-- Swap -->
              <li
                class="nav-item p-1"
                @click="closeLeftSidebar"
                v-if="$config.public.swapRouterAddress && $config.public.showFeatures.swap"
              >
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/swap/univ2') ? 'active' : ''"
                  aria-current="page"
                  to="/swap/univ2"
                >
                  <i class="bi bi-arrow-down-up me-2"></i> Swap
                </NuxtLink>
              </li>

              <!-- Airdrop -->
              <li
                class="nav-item p-1"
                @click="closeLeftSidebar"
                v-if="($config.public.airdropClaimDomainsAddress || $config.public.airdropApAddress) && $config.public.showFeatures.airdrop"
              >
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/airdrop') ? 'active' : ''"
                  aria-current="page"
                  to="/airdrop"
                >
                  <i class="bi bi-gift me-2"></i> Airdrop
                </NuxtLink>
              </li>

              <!-- Find User -->
              <li class="nav-item p-1" @click="closeLeftSidebar">
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/find-user') ? 'active' : ''"
                  aria-current="page"
                  to="/find-user"
                >
                  <i class="bi bi-binoculars me-2"></i> Find User
                </NuxtLink>
              </li>

              <!-- About -->
              <li class="nav-item p-1" @click="closeLeftSidebar">
                <NuxtLink
                  class="nav-link"
                  :class="$route.path.startsWith('/about') ? 'active' : ''"
                  aria-current="page"
                  to="/about"
                >
                  <i class="bi bi-patch-question me-2"></i> About
                </NuxtLink>
              </li>

              <!-- Add to favorites (if environment is farcaster) -->
              <li class="nav-item p-1" @click="handleAddFavorite" v-if="isFarcasterEnvironment">
                <span class="nav-link cursor-pointer">
                  <i class="bi bi-heart me-2"></i> Add to Favorites
                </span>
              </li>

              <!-- Share (if environment is farcaster) -->
              <li class="nav-item p-1" @click="handleShare" v-if="isFarcasterEnvironment">
                <span class="nav-link cursor-pointer">
                  <i class="bi bi-chat-left-quote me-2"></i> Share on Farcaster
                </span>
              </li>

          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sdk } from '@farcaster/miniapp-sdk'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import ProfileImage from '@/components/profile/ProfileImage.vue'

import { useAccountData } from '@/composables/useAccountData'
import { useSidebars } from '@/composables/useSidebars'
import { useSiteSettings } from '@/composables/useSiteSettings'

import { getActivityPoints } from '@/utils/balanceUtils'
import { getLessDecimals } from '@/utils/numberUtils'
import { getTextWithoutBlankCharacters } from '@/utils/textUtils'

export default {
  name: 'SidebarLeft',
  props: ['lSidebar', 'isMobile'],

  components: {
    ProfileImage
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

    getUserAp() {
      if (this.getCurentUserActivityPoints() > 0) {
        return getLessDecimals(this.getCurentUserActivityPoints())
      } else {
        return 0
      }
    },

    isFarcasterEnvironment() {
      return this.environment === 'farcaster'
    },

    sidebarLeftSticky() {
      return false;
    },
  },

  methods: {
    closeLeftSidebar() {
      if (this.isMobile) {
        this.lSidebar.hide()
        this.setLeftSidebar(false)
        this.setMainContent(true)
      }
    },

    async fetchActivityPoints() {
      if (this.$config.public.activityPointsAddress && this.address) {
        this.toast.info('Refreshing activity points...', { timeout: 2000 })

        const activityPoints = await getActivityPoints(this.address)

        this.setCurrentUserActivityPoints(activityPoints)
      }
    },

    async handleAddFavorite() {
      try {
        const result = await sdk.actions.addMiniApp()
        //console.log('Add to favorites result:', result)
        // Handle the result based on what the SDK returns
        if (result) {
          console.log('Added to favorites!')
          this.toast.success('Added to favorites!')
        }
      } catch (err) {
        console.error('Error adding mini app to favorites:', err)
        this.toast.error('Error adding mini app to favorites. Please reach out to the developer.')
      }
    },

    async handleShare() {
      try {
        await sdk.actions.composeCast({
          text: this.$config.public.farcasterShareText,
          embeds: [window.location.href],
        })
      } catch (err) {
        console.error('Error sharing:', err)
        this.toast.error('Error sharing the mini app link. Please reach out to the developer.')
      }
    },

    testToast() {
      this.toast.success('Test toast!')
    },
  },

  setup() {
    const config = useConfig()
    const { address, isConnected } = useAccount({ config })

    const { domainName, getCurentUserActivityPoints, setCurrentUserActivityPoints } = useAccountData()

    const { setLeftSidebar, setMainContent } = useSidebars()

    const { environment } = useSiteSettings()

    const toast = useToast()

    return {
      address,
      domainName,
      environment,
      getCurentUserActivityPoints,
      isConnected,
      setCurrentUserActivityPoints,
      setLeftSidebar,
      setMainContent,
      toast,
    }
  },
}
</script>