<template>
  <div>
    <p class="text-center">Claim {{ airdropAp }} {{ $config.public.chatTokenSymbol }} airdrop for past activity points.</p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <input v-model="airdropAp" type="text" class="form-control" disabled />

      <button class="btn btn-primary" type="button" aria-expanded="false">
        {{ $config.public.chatTokenSymbol }}
      </button>
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button
        :disabled="waiting || loadingData || airdropAp == 0 || airdropAp == null"
        class="btn btn-outline-primary"
        type="button"
        @click="claim"
      >
        <span
          v-if="loadingData || waiting"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Claim
      </button>
    </div>

    <hr />

    <p class="text-center">
      <small>
        If you're not eligible, or have already claimed the airdrop, the amount of
        {{ $config.public.chatTokenSymbol }} tokens shown is 0.
      </small>
    </p>
  </div>
</template>

<script>
import { useAccount, useConfig } from '@wagmi/vue'
import { formatEther } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import WaitingToast from '@/components/WaitingToast'
import { useAccountData } from '@/composables/useAccountData'
import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'AirdropActivityPoints',

  data() {
    return {
      waiting: false,
      loadingData: false,
      airdropApWei: 0,
    }
  },

  computed: {
    airdropAp() {
      return this.airdropApWei ? Math.round(Number(formatEther(this.airdropApWei))) : 0
    }
  },

  mounted() {
    if (this.address) {
      this.fetchAirdropData()
    }
  },

  methods: {
    async fetchAirdropData() {
      this.loadingData = true

      try {
        // preview airdrop claim for past APs
        const claimPreviewResult = await readData({
          address: this.$config.public.airdropApAddress,
          abi: [
            {
              name: 'claimPreview',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ type: 'address', name: '_address' }],
              outputs: [{ type: 'uint256', name: '' }]
            }
          ],
          functionName: 'claimPreview',
          args: [this.address]
        })

        if (claimPreviewResult) {
          this.airdropApWei = claimPreviewResult
        }
      } catch (error) {
        console.error('Error fetching airdrop data:', error)
      } finally {
        this.loadingData = false
      }
    },

    async claim() {
      this.waiting = true

      const claimApContract = {
        address: this.$config.public.airdropApAddress,
        abi: [{ name: 'claim', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] }],
        functionName: 'claim',
        args: [],
      }

      let toastWait;

      try {
        const hash = await writeData(claimApContract)

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          },
        )

        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.addToChatTokenBalanceWei(this.airdropApWei)

          this.airdropApWei = 0

          this.toast('Airdrop for past APs has been successfully claimed!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.waiting = false
        } else {
          this.toast.dismiss(toastWait)
          this.waiting = false
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')
          extractMessage = extractMessage.replace('ChatTokenClaimActivityPoints: ', '')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waiting = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waiting = false
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })
    const { addToChatTokenBalanceWei } = useAccountData()
    const toast = useToast()

    return {
      addToChatTokenBalanceWei,
      address,
      toast,
    }
  },

  watch: {
    address() {
      if (this.address) {
        this.fetchAirdropData()
      }
    },
  },
}
</script>
