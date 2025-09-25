<template>
  <div>
    <p class="text-center">
      Claim {{ $config.public.tokenSymbol }} rewards for the previous period. Make sure to visit this page once per week to
      claim your rewards!
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" aria-expanded="false" disabled>
        {{ $config.public.tokenSymbol }}
      </button>

      <input v-model="claimAmount" type="text" class="form-control" disabled />
    </div>

    <!-- Claim button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button :disabled="waiting" class="btn btn-outline-primary" type="button" @click="claim">
        <span
          v-if="loadingStakingData || waiting"
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        <span v-if="!lastPeriodUpdateNeeded">Claim</span>
        <span v-if="lastPeriodUpdateNeeded">Update Claim Period</span>
      </button>
    </div>

    <hr />

    <h4 class="text-center">Stats</h4>

    <ul>
      <li>
        Your stake: {{ getLessDecimals(stakeTokenBalance) }} {{ $config.public.lpTokenSymbol }} ({{ $config.public.stakeTokenSymbol }}
        tokens)
      </li>
      <li>
        Previous period rewards (total): {{ getLessDecimals(claimRewardsTotal) }} {{ $config.public.tokenSymbol }}

        <i
          class="bi bi-info-circle-fill"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="top"
          data-bs-content="Claimable now. Note that this is a total number for all stakers together."
        ></i>
      </li>
      <li>
        Current period rewards (so far): {{ getLessDecimals(futureRewards) }} {{ $config.public.tokenSymbol }}

        <i
          class="bi bi-info-circle-fill"
          data-bs-container="body"
          data-bs-toggle="popover"
          data-bs-placement="top"
          data-bs-content="Accrued rewards so far for all stakers together. Not claimable yet. Will be claimable in the next period."
        ></i>
      </li>
      <li>Period length: {{ periodLengthHumanReadable }}</li>
      <li>Current period start date: {{ lastPeriodDateTime }}</li>
    </ul>

    <p>
      <small> Important: Claim your rewards once per week, otherwise they will be forfeited. </small>
    </p>
  </div>
</template>

<script>
import { formatEther } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'

import WaitingToast from '@/components/WaitingToast'

import { writeData } from '@/utils/contractUtils'
import { getLessDecimals } from '@/utils/numberUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'StakingClaim',
  props: [
    'loadingStakingData',
    'claimAmountWei',
    'claimRewardsTotalWei',
    'futureRewardsWei',
    'lastClaimPeriod',
    'minDepositWei',
    'periodLength',
  ],
  emits: ['clearClaimAmount', 'updateLastClaimPeriod'],

  data() {
    return {
      claimers: [],
      waiting: false,
    }
  },

  components: {
    WaitingToast,
  },

  computed: {
    claimAmount() {
      if (
        this.claimAmountWei === null ||
        this.claimAmountWei === undefined ||
        this.claimAmountWei === '' ||
        this.claimAmountWei == 0
      ) {
        return 0
      }

      return formatEther(BigInt(this.claimAmountWei))
    },

    claimRewardsTotal() {
      if (
        this.claimRewardsTotalWei === null ||
        this.claimRewardsTotalWei === undefined ||
        this.claimRewardsTotalWei === '' ||
        this.claimRewardsTotalWei == 0
      ) {
        return 0
      }

      return formatEther(BigInt(this.claimRewardsTotalWei))
    },

    futureRewards() {
      if (
        this.futureRewardsWei === null ||
        this.futureRewardsWei === undefined ||
        this.futureRewardsWei === '' ||
        this.futureRewardsWei == 0
      ) {
        return 0
      }

      return formatEther(BigInt(this.futureRewardsWei))
    },

    lastPeriodDateTime() {
      if (
        this.lastClaimPeriod === null ||
        this.lastClaimPeriod === undefined ||
        this.lastClaimPeriod === '' ||
        this.lastClaimPeriod == 0
      ) {
        return 'Not available'
      }

      try {
        // Convert to number to ensure consistent type handling
        const lastClaimPeriodNum = Number(this.lastClaimPeriod)
        const d = new Date(lastClaimPeriodNum * 1000)
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)

        return (
          d.getDate() +
          ' ' +
          month +
          ' ' +
          d.getFullYear() +
          ' ' +
          d.getHours() +
          ':' +
          d.getMinutes().toString().padStart(2, '0')
        )
      } catch (error) {
        console.error('Error formatting lastPeriodDateTime:', error)
        return 'Invalid date'
      }
    },

    lastPeriodUpdateNeeded() {
      if (
        this.lastClaimPeriod === null ||
        this.lastClaimPeriod === undefined ||
        this.lastClaimPeriod === '' ||
        this.lastClaimPeriod == 0 ||
        this.periodLength === null ||
        this.periodLength === undefined ||
        this.periodLength === '' ||
        this.periodLength == 0
      ) {
        return false
      }

      try {
        // Convert all values to numbers to ensure consistent type handling
        const lastClaimPeriodNum = Number(this.lastClaimPeriod)
        const periodLengthNum = Number(this.periodLength)
        const now = Math.floor(Date.now() / 1000)

        if (now - (lastClaimPeriodNum + periodLengthNum) > 0) {
          // last claim period is more than the period length ago, so we need to update the claim period
          return true
        }

        return false
      } catch (error) {
        console.error('Error calculating lastPeriodUpdateNeeded:', error)
        return false
      }
    },

    minDeposit() {
      if (
        this.minDepositWei === null ||
        this.minDepositWei === undefined ||
        this.minDepositWei === '' ||
        this.minDepositWei == 0
      ) {
        return 0
      }

      return formatEther(BigInt(this.minDepositWei))
    },

    periodLengthHumanReadable() {
      if (
        this.periodLength === null ||
        this.periodLength === undefined ||
        this.periodLength === '' ||
        this.periodLength == 0
      ) {
        return null
      }

      // return period length (in seconds) in human readable format (minutes, hours, days)
      const seconds = Number(this.periodLength)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        return `${days} days`
      }

      if (hours > 0) {
        return `${hours} hours`
      }

      if (minutes > 0) {
        return `${minutes} minutes`
      }

      return `${seconds} seconds`
    },

    stakeTokenBalance() {
      // This would need to be passed as a prop from the parent component
      // For now, returning 0 as placeholder
      return 0
    },
  },

  methods: {
    async claim() {
      this.waiting = true

      let toastWait;

      try {
        // Set up staking contract configuration
        const stakingContractConfig = {
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              name: 'claimRewards',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [],
              outputs: [
                {
                  name: '',
                  type: 'uint256',
                  internalType: 'uint256'
                }
              ]
            }
          ],
          functionName: 'claimRewards',
          args: []
        }

        // Write the transaction
        const hash = await writeData(stakingContractConfig)

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

        // Wait for transaction receipt
        const receipt = await waitForTxReceipt(hash)

        if (receipt.status === 'success') {
          this.$emit('clearClaimAmount') // clear claim amount in parent component
          this.$emit('updateLastClaimPeriod') // update last claim period in parent component

          this.toast.dismiss(toastWait)

          this.toast('You have successfully claimed rewards!', {
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
        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }
        this.waiting = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waiting = false
      }
    },
  },

  setup() {
    const toast = useToast()

    return {
      toast,
    }
  },
}
</script>
