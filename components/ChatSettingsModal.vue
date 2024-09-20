<template>
  <div
    class="modal fade"
    id="chatSettingsModal"
    tabindex="-1"
    aria-labelledby="chatSettingsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="chatSettingsModalLabel">Settings</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>Swap</strong></p>

          <div class="row">
            <!-- Slippage tolerance -->
            <div class="col-sm-6 mb-2">
              <div class="input-group flex-nowrap">
                <span class="input-group-text" id="addon-wrapping">Slippage</span>
                <input type="text" class="form-control" v-model="slippage" aria-describedby="addon-wrapping" />
                <span class="input-group-text" id="addon-wrapping">%</span>
              </div>
            </div>

            <!-- Swap deadline -->
            <div class="col-sm-6 mb-2">
              <div class="input-group flex-nowrap">
                <span class="input-group-text" id="addon-wrapping">Deadline</span>
                <input v-model="deadline" type="text" class="form-control" aria-describedby="addon-wrapping" />
                <span class="input-group-text" id="addon-wrapping">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSiteStore } from '~/store/site'

export default {
  name: 'ChatSettingsModal',

  computed: {
    slippage: {
      // writable computed (aka two-way computed property)
      get() {
        return this.siteStore.getSlippage
      },
      set(value) {
        this.siteStore.setSlippage(value)
      },
    },

    deadline: {
      // writable computed (aka two-way computed property)
      get() {
        return this.siteStore.getSwapDeadline
      },
      set(value) {
        this.siteStore.setSwapDeadline(value)
      },
    },
  },

  setup() {
    const siteStore = useSiteStore()

    return {
      siteStore,
    }
  },
}
</script>
