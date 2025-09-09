<template>
  <div
    class="modal fade"
    id="siteSettingsModal"
    aria-labelledby="siteSettingsModalLabel"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="siteSettingsModalLabel">Site Settings</h1>
          <button 
            id="closeSiteSettingsModal"
            type="button" 
            class="btn-close" 
            data-bs-dismiss="modal" 
            aria-label="Close"
            @click="handleCloseClick"
          ></button>
        </div>
        <div class="modal-body">
          <p><strong>Swap Settings</strong></p>

          <div class="row">
            <!-- Slippage tolerance -->
            <div class="col-sm-6 mb-2">
              <div class="input-group flex-nowrap">
                <span class="input-group-text" id="slippage-addon">Slippage</span>
                <input type="text" class="form-control" v-model="slippageValue" aria-describedby="slippage-addon" />
                <span class="input-group-text" id="slippage-addon">%</span>
              </div>
            </div>

            <!-- Swap deadline -->
            <div class="col-sm-6 mb-2">
              <div class="input-group flex-nowrap">
                <span class="input-group-text" id="deadline-addon">Deadline</span>
                <input v-model="deadlineValue" type="text" class="form-control" aria-describedby="deadline-addon" />
                <span class="input-group-text" id="deadline-addon">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSiteSettings } from '@/composables/useSiteSettings'

export default {
  name: 'SiteSettingsModal',

  computed: {
    slippageValue: {
      // writable computed (aka two-way computed property)
      get() {
        return this.slippage
      },
      set(value) {
        this.setSlippage(value)
      },
    },

    deadlineValue: {
      // writable computed (aka two-way computed property)
      get() {
        return this.swapDeadline
      },
      set(value) {
        this.setSwapDeadline(value)
      },
    },
  },

  methods: {
    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeSiteSettingsModal')
      if (closeButton) {
        closeButton.blur()
      }
    },
  },

  setup() {
    const { slippage, swapDeadline, setSlippage, setSwapDeadline } = useSiteSettings()

    return {
      slippage,
      swapDeadline,
      setSlippage,
      setSwapDeadline,
    }
  },
}
</script>
