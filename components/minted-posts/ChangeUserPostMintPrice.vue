<template>
	<div class="modal fade" id="changeUserPostMintPriceModal" tabindex="-1" aria-labelledby="chatSettingsModalLabel" aria-hidden="true">
	  <div class="modal-dialog">
		<div class="modal-content">
		  <div class="modal-header">
			<h1 class="modal-title fs-5" id="chatSettingsModalLabel">Change Post Mint Price</h1>
			<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		  </div>
		  <div class="modal-body">
			<p><strong>Default Post Minting Price</strong></p>
	
			<div class="row">
			  <div class="col-sm-6 mb-2">
				<div class="input-group flex-nowrap">
				  <span class="input-group-text" id="addon-wrapping">Post Mint Price</span>
				  <input v-model="mintPrice" type="text" class="form-control" aria-describedby="addon-wrapping">
				  <span class="input-group-text" id="addon-wrapping">Token</span>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</div>
	</template>
	
	<script>	
	export default {
	  name: "ChatSettingsModal",
	
	  data() {
		return {
		  mintPrice: '10',
		}
	  },
	
	  mounted() {
		
	  },
	
	  computed: {
		
	  },
	
	  methods: {
		
	  },
	
	  setup() {
		return {

		}
	  },
	}
	</script>