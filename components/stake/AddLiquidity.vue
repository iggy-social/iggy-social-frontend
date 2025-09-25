<template>
  <p class="text-center">
    No {{ $config.public.lpTokenSymbol }}? Add liquidity to the {{ $config.public.chatTokenSymbol }}-{{ $config.public.tokenSymbol }}
    pool below to get some.
  </p>

  <!-- CHAT token field -->
  <div class="input-group mt-5">
    <button class="btn btn-primary" type="button" aria-expanded="false" disabled>
      {{ $config.public.chatTokenSymbol }}
    </button>

    <input
      v-model="depositAmount"
      type="text"
      class="form-control"
      placeholder="0.00"
      :disabled="waitingApproval || waitingDeposit"
      @keyup="fetchNativeCoinAmountWithTimeout"
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
        {{ chatTokenBalance }} {{ $config.public.chatTokenSymbol }}
      </span>
    </em>
  </small>

  <!-- Native coin field -->
  <div class="input-group mt-5">
    <button class="btn btn-primary" type="button" aria-expanded="false" disabled>
      {{ $config.public.tokenSymbol }}
    </button>

    <input v-model="nativeCoinAmount" type="text" class="form-control" :disabled="ethFieldDisabled" />
  </div>

  <!-- Native coin balance -->
  <small class="text-muted">
    <em>
      Balance:
      <span> {{ nativeBalance }} {{ $config.public.tokenSymbol }} </span>
    </em>
  </small>

  <div class="d-flex justify-content-center mt-4 mb-4">
    <!-- Approve token button -->
    <button
      :disabled="waitingApproval"
      v-if="allowanceTooLow && !nativeBalanceTooLow"
      class="btn btn-outline-primary"
      type="button"
      @click="approveToken"
    >
      <span v-if="waitingApproval" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Approve {{ $config.public.chatTokenSymbol }} token
    </button>

    <!-- Deposit button -->
    <button
      :disabled="waitingDeposit"
      v-if="!allowanceTooLow && !nativeBalanceTooLow"
      class="btn btn-outline-primary"
      type="button"
      @click="deposit"
    >
      <span v-if="waitingDeposit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Get {{ $config.public.lpTokenSymbol }}
    </button>

    <!-- Native balance too low button -->
    <button disabled v-if="nativeBalanceTooLow || chatBalanceTooLow" class="btn btn-outline-primary" type="button">
      <span v-if="nativeBalanceTooLow && !chatBalanceTooLow">{{ $config.public.tokenSymbol }}</span>
      <span v-if="chatBalanceTooLow">{{ $config.public.chatTokenSymbol }}</span>
      balance too low
    </button>
  </div>

  <p class="text-center">
    <small class="text-center" v-if="allowanceTooLow">
      <em>
        You will need to do 2 transactions: Approve {{ $config.public.chatTokenSymbol }} token and then Get
        {{ $config.public.lpTokenSymbol }}.
      </em>
    </small>
  </p>
</template>

<script>
import { parseEther, formatEther, formatUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast'
import { useAccountData } from '@/composables/useAccountData'
import { useSiteSettings } from '@/composables/useSiteSettings'
import { getNativeCoinBalanceWei } from '@/utils/balanceUtils'
import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'AddLiquidity',

  data() {
    return {
      allowanceWei: BigInt(0),
      balanceWei: null,
      debounce: null, // debounce to get ETH amount
      depositAmount: 0,
      ethFieldDisabled: true,
      nativeCoinAmount: 0,
      nativeCoinAmountWei: null,
      timeout: 800, // timeout for debounce in miliseconds
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

    chatBalanceTooLow() {
      return this.getChatTokenBalanceWei() < this.depositAmountWei
    },

    chatTokenBalance() {
      return formatUnits(this.getChatTokenBalanceWei(), this.$config.public.chatTokenDecimals || 18)
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return BigInt(0)
      }

      return parseEther(String(this.depositAmount))
    },

    nativeBalance() {
      if (this.balanceWei) {
        const nBal = Number(formatEther(this.balanceWei))

        if (nBal > 0) {
          return nBal.toFixed(2)
        } else {
          return nBal.toFixed(6)
        }
      }

      return 0
    },

    nativeBalanceTooLow() {
      if (this.balanceWei) {
        return this.nativeCoinAmountWei > this.balanceWei
      }

      return false
    },


  },

  methods: {
    async approveToken() {
      this.waitingApproval = true

      let toastWait;

      try {
        const contractConfig = {
          address: this.$config.public.chatTokenAddress,
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
          this.allowanceWei = this.depositAmountWei

          this.toast.dismiss(toastWait)

          this.toast('You have successfully approved tokens. Now proceed with getting LP tokens!', {
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

      const deadline = Math.floor(Date.now() / 1000) + 60 * this.swapDeadline

      // take nativeCoinAmount instead of nativeCoinAmountWei in case user entered a value in the field
      // themselves (holds true for the first time, when nativeCoinAmountWei is null)
      const ncAmountWei = parseEther(String(this.nativeCoinAmount))

      // subtract slippage (from user's chat settings)
      const slippageBps = Math.floor(Number(this.slippage) * 100) // convert to bps
      const ncAmountWeiMin = ncAmountWei - (ncAmountWei * BigInt(slippageBps) / BigInt(10000)) // apply slippage
      const depositAmountWeiMin = this.depositAmountWei - (this.depositAmountWei * BigInt(slippageBps) / BigInt(10000)) // apply slippage

      let toastWait;

      try {
        const contractConfig = {
          address: this.$config.public.swapRouterAddress,
          abi: [
            {
              name: 'addLiquidityETH',
              type: 'function',
              stateMutability: 'payable',
              inputs: [
                { name: 'token', type: 'address' },
                { name: 'amountTokenDesired', type: 'uint256' },
                { name: 'amountTokenMin', type: 'uint256' },
                { name: 'amountETHMin', type: 'uint256' },
                { name: 'to', type: 'address' },
                { name: 'deadline', type: 'uint256' }
              ],
              outputs: [
                { name: 'amountToken', type: 'uint256' },
                { name: 'amountETH', type: 'uint256' },
                { name: 'liquidity', type: 'uint256' }
              ]
            }
          ],
          functionName: 'addLiquidityETH',
          args: [
            this.$config.public.chatTokenAddress,
            BigInt(this.depositAmountWei), // chat token deposit
            BigInt(depositAmountWeiMin), // chat token deposit min
            BigInt(ncAmountWeiMin), // native coin deposit min
            this.address,
            BigInt(deadline)
          ],
          value: BigInt(ncAmountWei)
        }

        const hash = await writeData(contractConfig)

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: `Adding liquidity to the ${this.$config.public.chatTokenSymbol}-${this.$config.public.tokenSymbol} pool...`,
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

          this.toast(`You have successfully provided liquidity and received ${this.$config.public.lpTokenSymbol}!`, {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })

          this.allowanceWei = this.allowanceWei - this.depositAmountWei // subtract deposited amount from allowance
          let chatTokenBalanceWei = parseEther(this.chatTokenBalance)
          this.setChatTokenBalanceWei(chatTokenBalanceWei - this.depositAmountWei) // subtract deposited amount from chat token balance
          this.fetchLpTokenBalance()

          // clear deposit amount
          this.depositAmount = 0
          this.nativeCoinAmount = 0
          this.nativeCoinAmountWei = null
        } else {
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (error) {
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
        const contractConfig = {
          address: this.$config.public.chatTokenAddress,
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

        const result = await readData(contractConfig)
        if (result !== null) {
          this.allowanceWei = result
        }
      } catch (error) {
        console.error('Error fetching allowance:', error)
      }
    },

    async fetchLpTokenBalance() {
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
    },

    async fetchNativeCoinAmount() {
      try {
        const contractConfig = {
          address: this.$config.public.swapRouterAddress,
          abi: [
            {
              name: 'calculateETHForLiquidity',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { name: 'addressToken', type: 'address' },
                { name: 'amountToken', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'calculateETHForLiquidity',
          args: [
            this.$config.public.chatTokenAddress,
            parseEther(String(this.depositAmount))
          ]
        }

        const result = await readData(contractConfig)
        if (result !== null) {
          this.nativeCoinAmountWei = result
          this.nativeCoinAmount = formatEther(this.nativeCoinAmountWei)

          if (Number(this.nativeCoinAmountWei) === 0) {
            this.ethFieldDisabled = false
          }
        }
      } catch (error) {
        console.error('Error fetching native coin amount:', error)
      }
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.chatTokenBalance

      this.fetchNativeCoinAmount()
    },

    fetchNativeCoinAmountWithTimeout() {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      const self = this

      this.debounce = setTimeout(() => {
        self.fetchNativeCoinAmount()
      }, self.timeout)
    },

    async getUserNativeCoinBalanceWei() {
      if (this.address) {
        this.balanceWei = await getNativeCoinBalanceWei(this.address)
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const { getChatTokenBalanceWei, setChatTokenBalanceWei, setLpTokenBalanceWei} = useAccountData()
    const { swapDeadline, slippage } = useSiteSettings()
    const toast = useToast()

    return {
      address,
      getChatTokenBalanceWei,
      setChatTokenBalanceWei,
      setLpTokenBalanceWei,
      swapDeadline,
      slippage,
      toast,
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
