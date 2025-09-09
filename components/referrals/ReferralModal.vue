<template>
  <div 
    class="modal fade" 
    id="referralModal" 
    aria-labelledby="referralModalLabel" 
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="referralModalLabel">Share referral link</h1>
          <button 
            id="closeReferralModal"
            type="button" 
            class="btn-close" 
            data-bs-dismiss="modal" 
            aria-label="Close"
            @click="handleCloseClick"
          ></button>
        </div>
        <div class="modal-body">
          <p>
            Share your referral link and earn referral fees<span v-if="$config.public.showFeatures.activityPoints">
              (and activity points)</span
            >! 🤑
          </p>

          <ShareReferralLink />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShareReferralLink from '@/components/referrals/ShareReferralLink.vue'

export default {
  name: 'ReferralModal',

  components: {
    ShareReferralLink,
  },

  methods: {
    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeReferralModal')
      if (closeButton) {
        closeButton.blur()
      }
    },
  },
}
</script>
