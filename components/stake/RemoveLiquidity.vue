<template>
  <p class="text-center">
    Remove liquidity and get back {{ $config.public.chatTokenSymbol }} & {{ $config.public.tokenSymbol }} tokens.
  </p>

  <!-- LP token field -->
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
      :disabled="waitingApproval"
      v-if="allowanceTooLow"
      class="btn btn-outline-primary"
      type="button"
      @click="approveToken"
    >
      <span v-if="waitingApproval" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Approve {{ $config.public.lpTokenSymbol }}
    </button>

    <!-- Remove liquidity button -->
    <button
      :disabled="waitingDeposit"
      v-if="!allowanceTooLow"
      class="btn btn-outline-primary"
      type="button"
      @click="removeLiquidity"
    >
      <span v-if="waitingDeposit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Remove liquidity
    </button>
  </div>

  <p class="text-center">
    <small class="text-center" v-if="allowanceTooLow">
      <em> You will need to do 2 transactions: Approve {{ $config.public.lpTokenSymbol }} and then Remove liquidity. </em>
    </small>
  </p>
</template>

<script>
import { parseEther, formatUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast'

import { useAccountData } from '@/composables/useAccountData'
import { useSiteSettings } from '@/composables/useSiteSettings'

import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'RemoveLiquidity',

  data() {
    return {
      allowanceWei: BigInt(0),
      depositAmount: 0,
      waitingApproval: false,
      waitingDeposit: false,
    }
  },

  components: {
    WaitingToast,
  },

  mounted() {
    if (this.address) {
      this.fetchAllowance()
    }
  },

  computed: {
    allowanceTooLow() {
      return this.allowanceWei < this.depositAmountWei
    },

    lpTokenBalance() {
      return formatUnits(this.lpTokenBalanceWei || BigInt(0), this.$config.public.lpTokenDecimals || 18)
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return BigInt(0)
      }

      return parseEther(String(this.depositAmount))
    },

    lpTokenBalanceWei() {
      return this.getLpTokenBalanceWei()
    },
  },

  methods: {
    async approveToken() {
      this.waitingApproval = true

      let toastWait;

      try {
        const lpTokenContract = {
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
          args: [this.$config.public.swapRouterAddress, BigInt(this.depositAmountWei)]
        }

        const hash = await writeData(lpTokenContract)

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
          this.allowanceWei = this.depositAmountWei

          this.toast.dismiss(toastWait)

          this.toast('You have successfully approved tokens. Now proceed with removing liquidity!', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.waitingApproval = false

          this.removeLiquidity()
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
        console.error(e)
        this.waitingApproval = false
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
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingApproval = false
      }
    },

    async removeLiquidity() {
      this.waitingDeposit = true

      let toastWait;

      try {
        // Calculate the minimum amount of both native coin and chat token to be received
        const calculateContract = {
          address: this.$config.public.swapRouterAddress,
          abi: [
            {
              name: 'calculateETHAndTokensToReceive',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { name: '_lpToken', type: 'address' },
                { name: '_lpAmount', type: 'uint256' }
              ],
              outputs: [
                { name: 'amountToken', type: 'uint256' },
                { name: 'amountETH', type: 'uint256' }
              ]
            }
          ],
          functionName: 'calculateETHAndTokensToReceive',
          args: [this.$config.public.chatTokenAddress, BigInt(this.depositAmountWei)]
        }

        const chatETHAmounts = await readData(calculateContract)

        if (!chatETHAmounts) {
          throw new Error('Failed to calculate amounts')
        }

        const [tokenAmountWei, ncAmountWei] = chatETHAmounts

        const deadline = Math.floor(Date.now() / 1000) + 60 * this.swapDeadline // get deadline from user's settings

        // subtract slippage (from user's settings)
        const slippageBps = Math.floor(Number(this.slippage) * 100) // convert to bps
        const ncAmountWeiMin = ncAmountWei - (ncAmountWei * BigInt(slippageBps) / BigInt(10000)) // apply slippage
        const tokenAmountWeiMin = tokenAmountWei - (tokenAmountWei * BigInt(slippageBps) / BigInt(10000)) // apply slippage

        const routerContract = {
          address: this.$config.public.swapRouterAddress,
          abi: [
            {
              name: 'removeLiquidityETH',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'token', type: 'address' },
                { name: 'liquidity', type: 'uint256' },
                { name: 'amountTokenMin', type: 'uint256' },
                { name: 'amountETHMin', type: 'uint256' },
                { name: 'to', type: 'address' },
                { name: 'deadline', type: 'uint256' }
              ],
              outputs: [
                { name: 'amountToken', type: 'uint256' },
                { name: 'amountETH', type: 'uint256' }
              ]
            }
          ],
          functionName: 'removeLiquidityETH',
          args: [
            this.$config.public.chatTokenAddress,
            BigInt(this.depositAmountWei), // LP tokens to burn
            BigInt(tokenAmountWeiMin), // min amount of chat tokens to receive
            BigInt(ncAmountWeiMin), // min amount of native coins to receive
            this.address,
            BigInt(deadline),
          ]
        }

        const hash = await writeData(routerContract)

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: `Removing liquidity from the ${this.$config.public.lpTokenSymbol}-${this.$config.public.tokenSymbol} pool...`,
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

          this.toast(
            `You have successfully removed liquidity and received ${this.$config.public.lpTokenSymbol} & ${this.$config.public.tokenSymbol}!`,
            {
              type: 'success',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
            },
          )

          // Update allowance and balance
          this.allowanceWei = this.allowanceWei - this.depositAmountWei
          
          // Update LP token balance after successful liquidity removal
          const currentBalance = this.getLpTokenBalanceWei()
          const newBalance = currentBalance - this.depositAmountWei
          this.setLpTokenBalanceWei(newBalance)
          
          // Reset deposit amount
          this.depositAmount = 0
        } else {
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (error) {
        console.error(error)
        try {
          let extractMessage = error.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }
      } finally {
        this.toast.dismiss(toastWait)
        this.waitingDeposit = false
      }
    },

    async fetchAllowance() {
      try {
        const lpTokenContract = {
          address: this.$config.public.lpTokenAddress,
          abi: [
            {
              name: 'allowance',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' }
              ],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'allowance',
          args: [this.address, this.$config.public.swapRouterAddress]
        }

        const result = await readData(lpTokenContract)
        if (result) {
          this.allowanceWei = result
        }
      } catch (error) {
        console.error('Failed to fetch allowance:', error)
      }
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.lpTokenBalance
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const { getLpTokenBalanceWei, setLpTokenBalanceWei } = useAccountData()
    const { slippage, swapDeadline } = useSiteSettings()
    const toast = useToast()

    return {
      address,
      slippage,
      swapDeadline,
      toast,
      getLpTokenBalanceWei,
      setLpTokenBalanceWei,
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.fetchAllowance()
      }
    },
  },
}
</script>
