<template>
  <Head>
    <Title>Activity Points | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Activity Points | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mb-3 mt-3">Activity Points</h3>

      <p class="text-break mt-3">
        Your current Activity Points balance:
      </p>

      <!-- Input field -->
      <div class="row">
      <div class="col-md-5">
        <div class="input-group">
          <input 
            :value="userStore.getCurentUserActivityPoints"
            type="text"
            class="form-control"
            disabled
          >

          <button class="btn btn-primary disabled" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Activity Points
          </button>
        </div>
      </div>
      </div>

      <div class="mt-4 mb-3">
        <span>How to earn more Activity Points:</span>

        <ul>
          <li>Mint {{ $config.tldName }} domains</li>
          <li v-if="$config.showFeatures.swap">Swap tokens (when the receiving token is {{ $config.tokenSymbol }})</li>
          <li>Mint posts</li>
          <li>Invite others to {{ $config.projectName }} using referral links</li>
          <li v-if="$config.showFeatures.nftLaunchpad">Launch and mint NFTs via the NFT Launchpad</li>
          <li>Other kinds of earning APs are coming soon, stay tuned!</li>
        </ul>
      </div>

      <hr />

      <h5 class="text-break mt-4 mb-3">
        Share referral link to earn more APs
      </h5>

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
import { useEthers } from 'vue-dapp';
import { useUserStore } from '~/store/user';
import { getActivityPoints } from '~/utils/balanceUtils';
import ShareReferralLink from '~/components/referrals/ShareReferralLink.vue';

export default {
  name: 'ActivityPoints',

  components: {
    ShareReferralLink,
  },

  mounted() {
    this.fetchActivityPoints();
  },

  methods: {
    getActivityPoints,

    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress && this.address) {
        const activityPoints = await this.getActivityPoints(this.address);
        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    }
  },

  setup() {
    const { address } = useEthers();
    const userStore = useUserStore();

    return { address, userStore }
  },
}
</script>