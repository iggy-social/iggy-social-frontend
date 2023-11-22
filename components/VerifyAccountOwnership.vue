<template>
<!-- Verify Account Ownership modal -->
<div class="modal fade" id="verifyAccountModal" tabindex="-1" aria-labelledby="verifyAccountModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Verify Account Ownership</h5>
        <button id="closeVerifyAccountModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"></span>
        </button>
      </div>
      <div class="modal-body p-3 mb-3">

        <p>
          Verify that you really own this account/wallet. This will allow you to use chat, change profile image, and set some other settings.
        </p>

        <button class="btn btn-primary" @click="connectToOrbis">
          Verify your account
        </button>

      </div>
    </div>
  </div>
</div>
<!-- END Connect Wallet modal -->
</template>

<script>
import { useUserStore } from '~/store/user';
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  name: "VerifyAccountOwnership",

  methods: {
    async connectToOrbis() {
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      let res = await this.$orbis.connect_v2({
        provider: provider.provider, 
        lit: false
      });

      /** Check if connection is successful or not */
      if(res.status == 200) {
        this.userStore.setIsConnectedToOrbis(true);

        if (this.$orbis.session) {
          this.userStore.setDid(this.$orbis.session.did._id);
          this.userStore.setDidParent(this.$orbis.session.did._parentId);
        }

        document.getElementById('closeVerifyAccountModal').click();
      } else {
        console.log("Error verifying account: ", res);
        this.toast(res.result, {type: "error"});
      }
      
    },
  },

  setup() {
    const userStore = useUserStore();
    const toast = useToast();

    return { userStore, toast };
  },
}
</script>