<template>
  <div>
    <p class="text-center">
      Claim {{ domainChatReward }} {{ $config.public.chatTokenSymbol }} airdrop for each {{ $config.public.tldName }} domain that you
      hold.
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <input v-model="domainName" type="text" placeholder="Enter domain name" class="form-control" />

      <button class="btn btn-primary" type="button" aria-expanded="false">
        {{ $config.public.tldName }}
      </button>
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button
        :disabled="waiting || !domainName"
        class="btn btn-outline-primary"
        type="button"
        @click="claim"
      >
        <span
          v-if="waiting"
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
        Note that someone else can claim tokens (for a given domain) for you and save you on gas fees. You will still
        receive the same amount of {{ $config.public.chatTokenSymbol }} tokens as if you've made the claim yourself.
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
  name: 'AirdropDomainHolders',

  data() {
    return {
      domainName: null,
      waiting: false,
      domainChatRewardWei: 0,
      fetchingData: false,
    }
  },

  computed: {
    domainChatReward() {
      return Math.floor(Number(formatEther(this.domainChatRewardWei)))
    },
  },

  mounted() {
    if (this.address) {
      this.fetchAirdropData()
    }
  },

  methods: {
    async fetchAirdropData() {
      // fetch airdrop data
      this.fetchingData = true

      try {
        // fetch chat reward from the ChatTokenClaimDomains contract
        const chatRewardResult = await readData({
          address: this.$config.public.airdropClaimDomainsAddress,
          abi: [
            {
              name: 'chatReward',
              type: 'function',
              stateMutability: 'view',
              inputs: [],
              outputs: [{ type: 'uint256', name: '' }]
            }
          ],
          functionName: 'chatReward'
        })

        if (chatRewardResult) {
          this.domainChatRewardWei = chatRewardResult
        }
      } catch (error) {
        console.error('Error fetching airdrop data:', error)
      } finally {
        this.fetchingData = false
      }
    },

    async claim() {
      const toastWaitSign = this.toast({component: WaitingToast, props: {text: 'Please confirm the transaction.'}}, {type: 'info'})
      this.waiting = true

      const cleanDomainName = this.domainName.replace(this.$config.public.tldName, '').trim().toLowerCase()
      console.log(cleanDomainName)

      const chatTokenClaimDomainsContract = {
        address: this.$config.public.airdropClaimDomainsAddress,
        abi: [
          {
            name: 'claim',
            type: 'function',
            inputs: [
              {
                name: '_domainName',
                type: 'string'
              }
            ],
            outputs: [],
            stateMutability: 'nonpayable'
          }
        ]
      }

      let toastWait;

      try {
        const hash = await writeData({
          ...chatTokenClaimDomainsContract,
          functionName: 'claim',
          args: [cleanDomainName]
        })

        this.toast.dismiss(toastWaitSign)

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

          this.toast('Airdrop for ' + cleanDomainName + this.$config.public.tldName + ' has been successfully claimed!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.addToChatTokenBalanceWei(this.domainChatRewardWei)

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
          extractMessage = extractMessage.replace('ChatTokenClaimDomains: ', '')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waiting = false
      } finally {
        this.toast.dismiss(toastWaitSign)
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
