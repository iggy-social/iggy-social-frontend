<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

        <!-- Connect wallet / Switch Chain -->
        <div v-if="isMobile" class="card m-2 bg-light">
          <div class="card-body sidebar-card-body text-center mt-4">
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
            <SwitchChainButton v-if="isActivated && !isSupportedChain" />

            <div class="dropdown mt-2">
              <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Actions
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item"  v-if="isActivated" @click="disconnect">Disconnect wallet</button></li>
                <li><button class="dropdown-item" @click="deleteBrowserStorage">Delete browser storage</button></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Mint/register a domain name -->
        <NameMintWidget />

        <!-- Referrals -->
        <ReferralWidget />

        <!-- Playlist -->
        <div class="card m-2 bg-light" v-if="$config.showFeatures.spotify">
          <div class="card-header bg-light">{{ $config.projectName }} Playlist</div>
          <div class="card-body sidebar-card-body">
            <iframe
              style="border-radius: 12px"
              :src="
                'https://open.spotify.com/embed/playlist/' + $config.spotifyPlaylistId + '?utm_source=generator&theme=0'
              "
              width="100%"
              height="352"
              frameBorder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <!-- Swap tokens -->
        <SimpleSwapWidget
          v-if="$config.swapRouterAddress && $config.showFeatures.swap"
          :routerAddress="$config.swapRouterAddress"
          :tokens="tokens"
          title="Swap tokens"
        />

        <!-- Newsletter -->
        <div v-if="$config.newsletterLink && $config.showFeatures.newsletter" class="card m-2 bg-light">
          <div class="card-header bg-light">{{ $config.projectName }} Newsletter</div>
          <div class="card-body sidebar-card-body">
            <a class="btn btn-outline-primary mt-2 mb-2" target="_blank" :href="$config.newsletterLink">
              Join our newsletter!
              <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tokens from '~/assets/data/tokens.json'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import NameMintWidget from '~/components/names/NameMintWidget.vue'
import SimpleSwapWidget from '~/components/swap/SimpleSwapWidget.vue'
import ReferralWidget from '~/components/referrals/ReferralWidget.vue'
import { useEthers } from '~/store/ethers'
import { useSidebarStore } from '~/store/sidebars'

export default {
  name: 'SidebarRight',
  props: ['rSidebar', 'isMobile'],

  components: {
    ConnectWalletButton,
    NameMintWidget,
    ReferralWidget,
    SimpleSwapWidget,
    SwitchChainButton,
  },

  computed: {
    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    closeRightSidebar() {
      if (this.isMobile) {
        //this.rSidebar.hide();
        this.sidebarStore.setRightSidebar(false)
        this.sidebarStore.setMainContent(true)
      }
    },

    deleteBrowserStorage() {
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.location.reload()
    },
  },

  setup() {
    const { chainId, disconnect, isActivated } = useEthers()
    const sidebarStore = useSidebarStore()
    return { chainId, disconnect, isActivated, sidebarStore, tokens }
  },
}
</script>
