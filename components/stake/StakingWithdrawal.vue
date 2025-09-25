<template>
  <div>
    <p class="text-center">
      Unstake {{ $config.public.stakeTokenSymbol }} to receive back {{ $config.public.lpTokenSymbol }} (it will also auto-claim any
      remaining rewards).
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" aria-expanded="false" disabled>
        {{ $config.public.stakeTokenSymbol }}
      </button>

      <input
        v-model="withdrawalAmount"
        type="text"
        class="form-control"
        placeholder="0.00"
        :disabled="waitingWithdrawal"
      />

      <button @click="setMaxInputTokenAmount" class="btn btn-outline-secondary" type="button" id="button-addon2">
        <small>MAX</small>
      </button>
    </div>

    <!-- Token balance -->
    <small class="text-muted">
      <em>
        Balance:
        <span class="cursor-pointer hover-color" @click="setMaxInputTokenAmount">
          {{ stakeTokenBalance }} {{ $config.public.stakeTokenSymbol }}
        </span>
      </em>
    </small>

    <!-- Withdraw button -->
    <div class="d-flex justify-content-center mt-4 mb-4">
      <button
        :disabled="waitingWithdrawal || withdrawalIncorrect.error || isWithdrawalAmountNullOrEmpty"
        class="btn btn-outline-primary"
        type="button"
        @click="withdrawal"
      >
        <span
          v-if="loadingStakingData || waitingWithdrawal"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Unstake
      </button>
    </div>

    <div v-if="withdrawalIncorrect.error" class="alert alert-warning text-center text-dark" role="alert">
      {{ withdrawalIncorrect.message }}
    </div>

    <hr />

    <RemoveLiquidity />
  </div>
</template>

<script>
import { parseEther, formatUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast.vue'
import RemoveLiquidity from '@/components/stake/RemoveLiquidity.vue'

import { useAccountData } from '@/composables/useAccountData'

import { writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'StakingWithdrawal',
  props: ['loadingStakingData', 'lockedTimeLeft', 'minDepositWei'],
  emits: ['clearClaimAmount'],

  data() {
    return {
      withdrawalAmount: 0,
      waitingWithdrawal: false,
    }
  },

  components: {
    RemoveLiquidity,
  },

  mounted() {
    // Component now gets getStakeTokenBalanceWei from useAccountData composable
  },

  computed: {
    isWithdrawalAmountNullOrEmpty() {
      return (
        this.withdrawalAmount === null ||
        this.withdrawalAmount === '' ||
        this.withdrawalAmount == 0 ||
        Number(this.withdrawalAmount) === 0
      )
    },

    lockedSecondsHumanReadable() {
      // return lockedTimeLeft (in seconds) in human readable format (minutes, hours, days)
      const seconds = Number(this.lockedTimeLeft)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        return `${days + 1} days`
      }

      if (hours > 0) {
        return `${hours + 1} hours`
      }

      if (minutes > 0) {
        return `${minutes + 1} minutes`
      }

      return `${seconds + 1} seconds`
    },

    minDeposit() {
      return formatUnits(this.minDepositWei || BigInt(0), this.$config.public.lpTokenDecimals || 18)
    },

    stakeTokenBalance() {
      return formatUnits(this.getStakeTokenBalanceWei(), this.$config.public.stakeTokenDecimals || 18)
    },

    withdrawalAmountWei() {
      if (!this.withdrawalAmount || Number(this.withdrawalAmount) === 0) {
        return BigInt(0)
      }

      return parseEther(String(this.withdrawalAmount))
    },

    withdrawalIncorrect() {
      // tokens are locked
      if (Number(this.lockedTimeLeft) > 0) {
        return {
          error: true,
          message: 'Your staked tokens are still locked for ' + this.lockedSecondsHumanReadable + '.',
        }
      }

      // amount is too high
      if (this.withdrawalAmountWei > this.getStakeTokenBalanceWei) {
        return {
          error: true,
          message: 'The amount exceeds your staked token balance.',
        }
      }

      if (this.withdrawalAmountWei < this.getStakeTokenBalanceWei) {
        const remainingStakedAmountWei = this.getStakeTokenBalanceWei - this.withdrawalAmountWei

        if (remainingStakedAmountWei < (this.minDepositWei || BigInt(0))) {
          return {
            error: true,
            message:
              'You cannot unstake this amount because the staked balance left will be less than the minimum required staking amount (' +
              String(Number(this.minDeposit)) +
              ' tokens).',
          }
        }
      }

      // everything is fine
      return {
        error: false,
        message: '',
      }
    },
  },

  methods: {
    async withdrawal() {
      this.waitingWithdrawal = true

      let toastWait;

      try {
        const contractConfig = {
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              name: 'withdraw',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [{ name: '_assets', type: 'uint256' }],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'withdraw',
          args: [BigInt(this.withdrawalAmountWei)]
        }

        const hash = await writeData(contractConfig)

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
          // Update balance directly in the composable using the setter
          this.addToStakeTokenBalanceWei(-this.withdrawalAmountWei)
          
          this.$emit('clearClaimAmount') // clear claim amount in parent component

          this.toast.dismiss(toastWait)

          this.toast('You have successfully unstaked tokens!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.waitingWithdrawal = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingWithdrawal = false
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
          extractMessage = extractMessage.replace('PeriodicEthRewards: ', '')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingWithdrawal = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingWithdrawal = false
      }
    },

    setMaxInputTokenAmount() {
      this.withdrawalAmount = this.stakeTokenBalance
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const { getStakeTokenBalanceWei, addToStakeTokenBalanceWei } = useAccountData()
    const toast = useToast()

    return {
      address,
      toast,
      getStakeTokenBalanceWei,
      addToStakeTokenBalanceWei,
    }
  },
}
</script>
