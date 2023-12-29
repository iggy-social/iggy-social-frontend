<template>
<div class="card m-2 bg-light">
  <div class="card-header bg-light">Your referral link 🤑</div>
  <div class="card-body sidebar-card-body">
    <p>Share your referral link and earn referral fees!</p>
    <ShareReferralLink />
  </div>
</div>
</template>

<script>
import ShareReferralLink from '~/components/referrals/ShareReferralLink.vue';

export default {
  name: "ReferralWidget",

  components: {
    ShareReferralLink
  }
}
</script>