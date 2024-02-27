<template>
	<div
		ref="modalRef"
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
					
					<p v-if="!userHasCustomPrice">
						You currently do not have a custom price set up, so the price of minting your posts is the default post minting 
						price of {{ defaultPostPrice }} {{ $config.tokenSymbol }}.
					</p>

					<p v-if="userHasCustomPrice">
						Your current custom price for minting your posts is {{ selectedPostPrice }} {{ $config.tokenSymbol }}.
					</p>

					<p>
						You can set a custom price for your posts via this form:
					</p>

					<div class="row">
						<div class="col-sm-6 mb-2">
							<div class="input-group flex-nowrap">
								<input
									type="text"
									class="form-control"
									v-model="selectedPostPrice"
									aria-describedby="addon-wrapping"
									:disabled="inputDisabled"
								/>
								<span class="input-group-text" id="addon-wrapping">{{ $config.tokenSymbol }}</span>
							</div>
						</div>

						<small><em>If you set it to 0, the post mint price will be the 
						default price of {{ defaultPostPrice }} {{ $config.tokenSymbol }}</em></small>
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
			inputDisabled: false,
			isModalOpen: false,
			observer: null,
			selectedPostPrice: null,
			userHasCustomPrice: false,
		}
	},

	mounted() {
		// create observer to watch for modal open/close
		this.observer = new MutationObserver(mutations => {
			for (const m of mutations) {
				const newValue = m.target.getAttribute(m.attributeName)
				this.$nextTick(() => {
					this.onModalOpen(newValue, m.oldValue)
				})
			}
		})

		this.observer.observe(this.$refs.modalRef, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class'],
		})
	},

	// Can't be disconnected because the component is always mounted in default.vue
	beforeUnmount() {
		this.observer.disconnect()
		// console.log('observer disconnected')
	},

	methods: {
		async getDefaultPostPrice() {
			if (this.isActivated) {
				this.inputDisabled = true

				try {
					const iggyPostInterface = new ethers.utils.Interface([
						'function getAuthorsDefaultPrice(address) public view returns (uint256)',
						'function defaultPrice() external view returns (uint256)'
					])

					const iggyContract = new ethers.Contract(
						this.$config.iggyPostAddress,
						iggyPostInterface,
						this.signer,
					)

					const userPostPriceWei = await iggyContract.getAuthorsDefaultPrice(this.address)
					const defaultPostPriceWei = await iggyContract.defaultPrice()
					this.defaultPostPrice = ethers.utils.formatUnits(defaultPostPriceWei, this.$config.tokenDecimals)

					let postPriceWei;

					if (userPostPriceWei.isZero()) {
						postPriceWei = defaultPostPriceWei
						this.userHasCustomPrice = false
					} else {
						postPriceWei = userPostPriceWei
						this.userHasCustomPrice = true
					}

					this.selectedPostPrice = ethers.utils.formatUnits(postPriceWei, this.$config.tokenDecimals)
				} catch (err) {
					console.log('Failed to get default post price: ' + err)
				} finally {
					this.inputDisabled = false
				}
			}
		},
		async changeDefaultPostPrice() {
			this.loading = true
			this.inputDisabled = true

			if (this.isActivated) {
				const iggyPostInterface = new ethers.utils.Interface([
					'function authorSetDefaultPrice(uint256 _price) external',
				])

				const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, this.signer)
				const postPriceWei = ethers.utils.parseUnits(this.selectedPostPrice, this.$config.tokenDecimals)

				try {
					// feat: cannot set price below 0
					if (postPriceWei.isNegative()) {
						this.toast('Error: Cannot set a negative price', { type: 'error' })
						return
					}
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
					// update the price whenever tx is successful or not
					this.getDefaultPostPrice()
					this.loading = false
					this.inputDisabled = false
				}
			}
		},
		onModalOpen(classAttrValue) {
			const classList = classAttrValue.split(' ')
			if (classList.includes('show')) {
				this.isModalOpen = true
			} else {
				this.isModalOpen = false
			}
		},
	},

	setup() {
		const { address, isActivated, signer } = useEthers()
		const toast = useToast()

		return { address, isActivated, signer, toast }
	},

	watch: {
		isModalOpen() {
			if (this.isModalOpen) {
				this.getDefaultPostPrice()
			}
		},
	},
}
</script>
