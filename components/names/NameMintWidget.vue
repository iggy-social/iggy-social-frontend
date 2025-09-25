<template>
  <div class="card m-2 bg-light">
    <div class="card-header bg-light">Get a {{ $config.public.tldName }} name</div>

    <div class="card-body sidebar-card-body">
      <p>Get yourself a {{ $config.public.tldName }} username and start chatting with other community members.</p>

      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control text-end"
          placeholder="enter name"
          aria-describedby="mint-name"
          v-model="domainName"
        />
        <span class="input-group-text" id="mint-name">{{ $config.public.tldName }}</span>
      </div>

      <p v-if="domainNotValid.invalid && domainNotValid.message" class="text-danger">
        <small> <i class="bi bi-exclamation-octagon"></i> {{ domainNotValid.message }} </small>
      </p>

      <p>Minting price: {{ getNamePrice }} {{ $config.public.tokenSymbol }}</p>

      <div class="text-center">
        <button
          v-if="isConnected && isSupportedChain"
          class="btn btn-outline-primary mt-2 mb-2"
          :disabled="paused || domainNotValid.invalid || balanceTooLow"
          @click="mintName"
        >
          <span
            v-if="loadingMint || loadingData"
            class="spinner-border spinner-border-sm mx-1"
            role="status"
            aria-hidden="true"
          ></span>
          <span v-if="loadingData">Loading data...</span>
          <span v-if="!loadingMint && !loadingData && balanceTooLow">Balance too low</span>
          <span v-if="!loadingMint && !loadingData && !balanceTooLow">Mint username</span>
        </button>

        <ConnectWalletButton v-if="!isConnected" class="btn-outline-primary mt-2 mb-2" btnText="Connect Wallet" />
        <SwitchChainButton v-if="isConnected && !isSupportedChain" />
      </div>
    </div>
  </div>
</template>

<script>
import { formatUnits, parseUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import WaitingToast from '@/components/WaitingToast'
import ConnectWalletButton from '@/components/connect/ConnectWalletButton'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'

import { useAccountData } from '@/composables/useAccountData'

import { getNativeCoinBalanceEth } from '@/utils/balanceUtils'
import { fetchReferrer, storeUsername } from '@/utils/browserStorageUtils'
import { readData, writeData } from '@/utils/contractUtils'
import { getDomainName, getDomainHolder, validateDomainName } from '@/utils/domainUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'NameMintWidget',

  data() {
    return {
      balanceEth: null,
      domainName: null,
      isMinter: false,
      loadingData: false,
      loadingMint: false,
      paused: true,
      price: null,
      price1char: null,
      price2char: null,
      price3char: null,
      price4char: null,
      price5char: null,
      referralFee: null,
    }
  },

  components: {
    ConnectWalletButton,
    SwitchChainButton,
    WaitingToast,
  },

  mounted() {
    this.fetchDomainData()
    this.getUserNativeCoinBalanceEth()
  },

  computed: {
    balanceTooLow() {
      if (!this.balanceEth || !this.getNamePrice) return true
      return Number(this.balanceEth) < Number(this.getNamePrice)
    },

    domainNotValid() {
      return validateDomainName(this.domainName)
    },

    getNamePrice() {
      if (this.$config.public.punkNumberOfPrices === 1) {
        return this.price
      } else if (this.domainName) {
        if (this.domainName.match(/./gu).length === 1) {
          return this.price1char
        } else if (this.domainName.match(/./gu).length === 2) {
          return this.price2char
        } else if (this.domainName.match(/./gu).length === 3) {
          return this.price3char
        } else if (this.domainName.match(/./gu).length === 4) {
          return this.price4char
        } else if (this.domainName.match(/./gu).length >= 5) {
          return this.price5char
        } else {
          return this.price5char
        }
      } else {
        return this.price5char
      }
    },

    isSupportedChain() {
      if (this.chainId === this.$config.public.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    async fetchDomainData() {
      this.loadingData = true

      this.isMinter = this.$config.public.punkMinterAddress !== ''

      const contractInterface = [
        {
          inputs: [],
          name: 'buyingEnabled',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'paused',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price1char',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price2char',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price3char',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price4char',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'price5char',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'referral',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'referralFee',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        }
      ]

      let contractAddress

      if (this.isMinter) {
        contractAddress = this.$config.public.punkMinterAddress
      } else {
        contractAddress = this.$config.public.punkTldAddress
      }

      // fetch paused status
      if (this.isMinter) {
        const pausedResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'paused',
          args: []
        })
        this.paused = pausedResult
      } else {
        const buyingEnabledResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'buyingEnabled',
          args: []
        })
        this.paused = !buyingEnabledResult
      }

      // fetch price(s)
      if (this.$config.public.punkNumberOfPrices === 1) {
        const priceResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price',
          args: []
        })
        if (priceResult !== null) {
          this.price = formatUnits(priceResult, this.$config.public.tokenDecimals)
        }
      } else if (this.$config.public.punkNumberOfPrices === 5) {
        const price1charResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price1char',
          args: []
        })
        if (price1charResult !== null) {
          this.price1char = formatUnits(price1charResult, this.$config.public.tokenDecimals)
        }

        const price2charResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price2char',
          args: []
        })
        if (price2charResult !== null) {
          this.price2char = formatUnits(price2charResult, this.$config.public.tokenDecimals)
        }

        const price3charResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price3char',
          args: []
        })
        if (price3charResult !== null) {
          this.price3char = formatUnits(price3charResult, this.$config.public.tokenDecimals)
        }

        const price4charResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price4char',
          args: []
        })
        if (price4charResult !== null) {
          this.price4char = formatUnits(price4charResult, this.$config.public.tokenDecimals)
        }

        const price5charResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'price5char',
          args: []
        })
        if (price5charResult !== null) {
          this.price5char = formatUnits(price5charResult, this.$config.public.tokenDecimals)
        }
      }

      // fetch referral fee
      if (this.isMinter) {
        const referralFeeResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'referralFee',
          args: []
        })
        this.referralFee = referralFeeResult
      } else {
        const referralResult = await readData({
          address: contractAddress,
          abi: contractInterface,
          functionName: 'referral',
          args: []
        })
        this.referralFee = referralResult
      }

      this.loadingData = false
    },

    async fetchUserDomain() {
      if (this.isConnected) {
        const userDomain = await getDomainName(this.address)

        if (userDomain) {
          this.setDomainName(userDomain)

          const fullDomainName = userDomain.split('.')[0] + this.$config.public.tldName

          storeUsername(window, this.address, fullDomainName)
        } else {
          this.setDomainName('')
        }
      }
    },

    async getUserNativeCoinBalanceEth() {
      if (this.address) {   
        this.balanceEth = await getNativeCoinBalanceEth(this.address)
      }
    },

    async mintName() {
      this.loadingMint = true

      if (this.isConnected && !this.domainNotValid.invalid) {
        // check if name is already taken
        const domainHolder = await getDomainHolder(this.domainName.toLowerCase())

        if (domainHolder && domainHolder !== '0x0000000000000000000000000000000000000000') {
          this.toast('This name is already taken', { type: 'error' })
          this.loadingMint = false
          return
        }

        let toastWait;

        try {
          const mintInterface = [
            {
              inputs: [
                { name: '_domainName', type: 'string' },
                { name: '_domainHolder', type: 'address' },
                { name: '_referrer', type: 'address' }
              ],
              name: 'mint',
              outputs: [{ name: '', type: 'uint256' }],
              stateMutability: 'payable',
              type: 'function'
            }
          ]

          let contractAddress

          if (this.isMinter) {
            contractAddress = this.$config.public.punkMinterAddress
          } else {
            contractAddress = this.$config.public.punkTldAddress
          }

          const txHash = await writeData({
            address: contractAddress,
            abi: mintInterface,
            functionName: 'mint',
            args: [
              this.domainName.toLowerCase(), // domain name
              this.address, // domain receiver
              fetchReferrer(window), // referrer
            ],
            value: parseUnits(this.getNamePrice, this.$config.public.tokenDecimals),
          })

          toastWait = this.toast(
            {
              component: WaitingToast,
              props: {
                text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
              },
            },
            {
              type: 'info',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            },
          )

          const receipt = await waitForTxReceipt(txHash)

          if (receipt.status === 'success') {
            this.toast.dismiss(toastWait)
            this.fetchUserDomain()
            this.toast('You have successfully minted a name!', {
              type: 'success',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            })
            this.loadingMint = false
          } else {
            this.toast.dismiss(toastWait)
            this.toast('Transaction has failed.', {
              type: 'error',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            })
            this.loadingMint = false
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
          this.loadingMint = false
          return
        } finally {
          this.toast.dismiss(toastWait)
          this.loadingMint = false
        }
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address, chainId, isConnected } = useAccount({ config })

    const { setDomainName } = useAccountData()
    const toast = useToast()

    return { 
      address, 
      chainId, 
      isConnected, 
      setDomainName,
      toast 
    }
  },

  watch: {
    async address(newAddress, oldAddress) {
      await this.getUserNativeCoinBalanceEth()
    }
  }
}
</script>
