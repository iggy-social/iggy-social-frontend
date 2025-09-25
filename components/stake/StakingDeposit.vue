<template>
  <div>
    <p class="text-center">
      Stake {{ $config.public.lpTokenSymbol }} to receive periodic staking rewards in {{ $config.public.tokenSymbol }} tokens (min
      deposit: {{ minDeposit }} {{ $config.public.lpTokenSymbol }}).
    </p>

    <!-- Input field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" aria-expanded="false" disabled>
        {{ $config.public.lpTokenSymbol }}
      </button>

      <input
        v-model="depositAmount"
        type="text"
        class="form-control"
        placeholder="0.00"
        :disabled="waitingApproval || waitingDeposit"
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
          {{ lpTokenBalance }} {{ $config.public.lpTokenSymbol }}
        </span>
      </em>
    </small>

    <div class="d-flex justify-content-center mt-4 mb-4">
      <!-- Approve token button -->
      <button
        :disabled="waitingApproval || depositTooLow"
        v-if="allowanceTooLow"
        class="btn btn-outline-primary"
        type="button"
        @click="approveToken"
      >
        <span
          v-if="loadingStakingData || waitingApproval"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Approve token
      </button>

      <!-- Deposit button -->
      <button
        :disabled="waitingDeposit || depositTooLow"
        v-if="!allowanceTooLow"
        class="btn btn-outline-primary"
        type="button"
        @click="deposit"
      >
        <span
          v-if="loadingStakingData || waitingDeposit"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Stake
      </button>
    </div>

    <p class="text-center">
      <small class="text-center" v-if="allowanceTooLow">
        <em> You will need to do 2 transactions: Approve token and then Stake. </em>
      </small>
    </p>

    <hr class="mb-5" />

    <AddLiquidity />
  </div>
</template>

<script>
import { parseUnits, formatUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast.vue'
import AddLiquidity from '@/components/stake/AddLiquidity.vue'

import { useAccountData } from '@/composables/useAccountData'

import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'StakingDeposit',
  props: ['loadingStakingData', 'minDepositWei', 'maxDepositWei', 'lpTokenAllowanceWei'],
  emits: ['clearClaimAmount', 'fetchLockedTimeLeft', 'updateAllowance'],

  data() {
    return {
      allowanceWei: BigInt(0),
      depositAmount: 0,
      waitingApproval: false,
      waitingDeposit: false,
    }
  },

  components: {
    AddLiquidity,
  },

  mounted() {
    this.allowanceWei = this.lpTokenAllowanceWei || BigInt(0)
    this.fetchLpTokenBalance()
  },

  computed: {
    allowanceTooLow() {
      return this.allowanceWei < this.depositAmountWei
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return BigInt(0)
      }

      return parseUnits(String(this.depositAmount), this.$config.public.lpTokenDecimals)
    },

    depositTooLow() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return true
      }

      return this.depositAmountWei < (this.minDepositWei || BigInt(0))
    },

    lpTokenBalance() {
      return formatUnits(this.getLpTokenBalanceWei(), this.$config.public.lpTokenDecimals)
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

      return formatUnits(this.minDepositWei, 18)
    },
  },

  methods: {
    async fetchLpTokenBalance() {
      if (this.address) {
        try {
          const contractConfig = {
            address: this.$config.public.lpTokenAddress,
            abi: [
              {
                name: 'balanceOf',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }]
              }
            ],
            functionName: 'balanceOf',
            args: [this.address]
          }

          const result = await readData(contractConfig)
          if (result !== null) {
            this.setLpTokenBalanceWei(result)
          }
        } catch (error) {
          console.error('Error fetching LP token balance:', error)
        }
      }
    },

    async approveToken() {
      this.waitingApproval = true

      let toastWait;

      try {
        const contractConfig = {
          address: this.$config.public.lpTokenAddress,
          abi: [
            {
              name: 'approve',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool' }]
            }
          ],
          functionName: 'approve',
          args: [this.$config.public.stakingContractAddress, BigInt(this.depositAmountWei)]
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
          this.$emit('updateAllowance', this.depositAmountWei)

          this.toast.dismiss(toastWait)

          this.toast('You have successfully approved tokens. Now proceed with staking!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.waitingApproval = false

          this.deposit()
        } else {
          this.toast.dismiss(toastWait)
          this.waitingApproval = false
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
        this.waitingApproval = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingApproval = false
      }
    },

    async deposit() {
      this.waitingDeposit = true

      let toastWait;

      try {
        const contractConfig = {
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              name: 'deposit',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [{ name: '_assets', type: 'uint256' }],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'deposit',
          args: [BigInt(this.depositAmountWei)]
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
          this.$emit('updateAllowance', BigInt(0)) // reset allowance
          
          // Update LP token balance by subtracting the deposited amount
          const currentLpBalance = this.getLpTokenBalanceWei()
          this.setLpTokenBalanceWei(currentLpBalance - this.depositAmountWei)
          
          // Update Stake token balance by adding the deposited amount (1:1 ratio)
          const currentStakeBalance = this.getStakeTokenBalanceWei()
          this.setStakeTokenBalanceWei(currentStakeBalance + this.depositAmountWei)
          
          this.$emit('clearClaimAmount') // clear claim amount in parent component
          this.$emit('fetchLockedTimeLeft') // fetch locked time left in parent component

          // reset deposit amount
          this.depositAmount = 0

          this.toast.dismiss(toastWait)

          this.toast('You have successfully staked tokens!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.waitingDeposit = false
        } else {
          this.toast.dismiss(toastWait)
          this.waitingDeposit = false
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
        this.waitingDeposit = false
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingDeposit = false
      }
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.lpTokenBalance
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const {  
      getLpTokenBalanceWei, 
      setLpTokenBalanceWei,
      getStakeTokenBalanceWei,
      setStakeTokenBalanceWei
    } = useAccountData()

    const toast = useToast()

    return {
      address,
      toast,
      getLpTokenBalanceWei,
      setLpTokenBalanceWei,
      getStakeTokenBalanceWei,
      setStakeTokenBalanceWei,
    }
  },

  watch: {
    lpTokenAllowanceWei() {
      this.allowanceWei = this.lpTokenAllowanceWei || BigInt(0)
    },
  },
}
</script>
