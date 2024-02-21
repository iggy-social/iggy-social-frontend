<template>
	<div
		class="modal fade"
		id="changeDefaultPostPriceModal"
		tabindex="-1"
		aria-labelledby="changeDefaultPostPriceModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="changeDefaultPostPriceModalLabel">Change Post Mint Price</h1>
					<button
						id="closeChangeDefaultPostPriceModal"
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<p><strong>Default Post Minting Price</strong></p>

					<div class="row">
						<div class="col-sm-6 mb-2">
							<div class="input-group flex-nowrap">
								<span class="input-group-text" id="addon-wrapping">Price</span>
								<input
									type="text"
									class="form-control"
									v-model="defaultPostPrice"
									aria-describedby="addon-wrapping"
								/>
								<!-- <span class="input-group-text" id="addon-wrapping">Token</span> -->
							</div>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

					<button type="button" :disabled="loading" class="btn btn-primary" @click="changeDefaultPostPrice">
						<span
							v-if="loading"
							class="spinner-border spinner-border-sm mx-1"
							role="status"
							aria-hidden="true"
						></span>
						Submit
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { useEthers } from 'vue-dapp'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import WaitingToast from '~/components/WaitingToast'

export default {
	name: 'ChangeUserPostMintPriceModal',

	data() {
		return {
			defaultPostPrice: null,
			loading: false,
		}
	},

	computed: {},

	methods: {
		async getDefaultPostPrice() {
			if (this.isActivated) {
				const iggyPostInterface = new ethers.utils.Interface([
					'function getAuthorsDefaultPrice(address) public view returns (uint256)',
				])

				const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, this.signer)
				const postPriceWei = await iggyContract.getAuthorsDefaultPrice(this.address)

				this.defaultPostPrice = ethers.utils.formatUnits(postPriceWei, this.$config.tokenDecimals)
			}
		},
		async changeDefaultPostPrice() {
			this.loading = true

			if (this.isActivated) {
				const iggyPostInterface = new ethers.utils.Interface([
					'function authorSetDefaultPrice(uint256 _price) external',
				])

				const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, this.signer)
				const postPriceWei = ethers.utils.parseUnits(this.defaultPostPrice, this.$config.tokenDecimals)

				try {
					const tx = await iggyContract.authorSetDefaultPrice(postPriceWei)

					const toastWait = this.toast(
						{
							component: WaitingToast,
							props: {
								text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
							},
						},
						{
							type: 'info',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						},
					)

					const receipt = await tx.wait()

					if (receipt.status === 1) {
						this.toast.dismiss(toastWait)
						this.toast('You have successfully changed your default post price!', {
							type: 'success',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						})
						document.getElementById('closeChangeDefaultPostPriceModal').click()
						this.getDefaultPostPrice() // update the default post price
					} else {
						this.toast.dismiss(toastWait)
						this.toast('Transaction has failed.', {
							type: 'error',
							onClick: () =>
								window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
						})
						console.log(receipt)
					}
				} catch (e) {
					console.log('error: ' + e)
					this.toast('Error: ' + e, { type: 'error' })
					return
				} finally {
					this.loading = false
				}
			}
		},
	},

	setup() {
		const { address, isActivated, signer } = useEthers()
		const toast = useToast()

		return { address, isActivated, signer, toast }
	},

	watch: {
		isActivated() {
			if (this.isActivated) {
				this.getDefaultPostPrice() // get the default post price when landing the /profile page
			}
		},
	},
}
</script>
