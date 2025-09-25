<template>
  <Head>
    <Title>Activity Points | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Activity Points | ' + $config.public.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mb-3 mt-3">Activity Points</h3>

      <p class="text-break mt-3">Your current Activity Points balance:</p>

      <!-- Input field -->
      <div class="row">
        <div class="col-md-5">
          <div class="input-group">
            <input :value="getLessDecimals(getCurentUserActivityPoints())" type="text" class="form-control" disabled />

            <button class="btn btn-primary disabled" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Activity Points
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 mb-3">
        <span>How to earn more Activity Points:</span>

        <ul>
          <li>Mint {{ $config.public.tldName }} domains</li>
          <li v-if="$config.public.showFeatures.swap">Swap tokens (when the receiving token is {{ $config.public.tokenSymbol }})</li>
          <li>Invite others to {{ $config.public.projectName }} using referral links</li>
          <li v-if="$config.public.showFeatures.nftLaunchpad">Launch and mint NFTs via the NFT Launchpad</li>
          <li>Other kinds of earning APs are coming soon, stay tuned!</li>
        </ul>
      </div>

      <hr />

      <h5 class="text-break mt-4 mb-3">Share referral link to earn more APs</h5>

      <p class="text-break mt-2 mb-3">
        Earn additional activity points (and referral fees) by sharing your referral link:
      </p>

      <div class="row mt-2">
        <div class="col-md-6">
          <ShareReferralLink />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAccount, useConfig } from '@wagmi/vue'

import ShareReferralLink from '@/components/referrals/ShareReferralLink.vue'
import { useAccountData } from '@/composables/useAccountData'
import { getActivityPoints } from '@/utils/balanceUtils'
import { getLessDecimals } from '@/utils/numberUtils'

export default {
  name: 'ActivityPoints',

  components: {
    ShareReferralLink,
  },

  mounted() {
    this.fetchActivityPoints()
  },

  methods: {
    getActivityPoints,

    async fetchActivityPoints() {
      if (this.$config.public.activityPointsAddress && this.address) {
        const activityPoints = await this.getActivityPoints(this.address)
        this.setCurrentUserActivityPoints(activityPoints)
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const { getCurentUserActivityPoints, setCurrentUserActivityPoints } = useAccountData()

    return { 
      address, 
      getCurentUserActivityPoints, 
      setCurrentUserActivityPoints 
    }
  },
}
</script>
