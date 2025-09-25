<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: rightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

        <!-- Connect wallet / Switch Chain -->
        <div v-if="isMobile" class="card m-2 bg-light">
          <div class="card-body sidebar-card-body text-center mt-4">
            <div class="dropdown-center d-grid">
              <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Actions
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item"  v-if="isConnected" @click="disconnect">Disconnect wallet</button></li>
                <li><button class="dropdown-item" @click="deleteBrowserStorage">Delete browser storage</button></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Widget 
        <div class="card m-2 bg-light">
          <div class="card-header bg-light">Widget</div>
          <div class="card-body sidebar-card-body">
            <p>
              I am a little sidebar widget: Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Quisque sed ipsum vitae metus eleifend hendrerit ornare quis tortor.
            </p>
          </div>
        </div>
        -->

        <!-- Mint/register a domain name -->
        <NameMintWidget />

        <!-- Referral widget -->
        <ReferralWidget />

      </div>
    </div>
  </div>
</template>

<script>
import { useAccount, useConfig, useDisconnect } from '@wagmi/vue'
import NameMintWidget from '@/components/names/NameMintWidget.vue'
import ReferralWidget from '@/components/referrals/ReferralWidget.vue'
import { useSidebars } from '@/composables/useSidebars'
import { useSiteSettings } from '@/composables/useSiteSettings'

export default {
  name: 'SidebarRight',
  props: ['rSidebar', 'isMobile'],

  components: { 
    NameMintWidget,
    ReferralWidget,
  },

  methods: {
    closeRightSidebar() {
      if (this.isMobile) {
        //this.rSidebar.hide();
        this.setRightSidebar(false)
        this.setMainContent(true)
      }
    },

    deleteBrowserStorage() {
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.location.reload()
    },
  },

  setup() {
    const { rightSidebar, setRightSidebar, setMainContent } = useSidebars()
    const { environment } = useSiteSettings()

    const config = useConfig()
    const { isConnected } = useAccount({ config })

    // DISCONNECT
    const { disconnect } = useDisconnect({
      config,
      mutation: {
        onSuccess() {
          if (environment.value !== 'farcaster') {
            window.localStorage.setItem("connected-with", "")
            // needed to prevent wagmi's bug which sometimes happens ("ConnectorAlreadyConnectedError")
            //window.location.reload()
          }
        },
      }
    })

    return {
      disconnect,
      isConnected,
      rightSidebar,
      setRightSidebar,
      setMainContent,
    }
  },
}
</script>