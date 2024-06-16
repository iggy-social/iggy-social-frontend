import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import { computed, markRaw } from 'vue'
import { EIP1193Provider, shortenAddress, useVueDapp } from '@vue-dapp/core'

export const useEthersStore = defineStore('ethers', {
  state: (): {
    provider: ethers.providers.Web3Provider | null
    signer: ethers.Signer | null
    balance: bigint
  } => ({
    provider: null,
    signer: null,
    balance: BigInt(0),
  }),
  actions: {
    async setWallet(_provider: EIP1193Provider) {
      this.provider = markRaw(new ethers.providers.Web3Provider(_provider))
      this.signer = markRaw(this.provider.getSigner())
    },

    resetWallet() {
      this.provider = null
      this.signer = null
      this.balance = BigInt(0)
    },

    async fetchBalance() {
      if (!this.signer) return
      this.balance = (await this.signer.getBalance()).toBigInt()
    },
  },
})

export function useEthers() {
  const ethersStore = useEthersStore()

  return {
    ...useVueDapp(useNuxtApp().$pinia),
    provider: computed(() => ethersStore.provider),
    signer: computed(() => ethersStore.signer),
    balance: computed(() => ethersStore.balance),
    isActivated: computed(() => {
      const { isConnected } = useVueDapp(useNuxtApp().$pinia)
      return isConnected.value
    }),
    setWallet: ethersStore.setWallet,
    resetWallet: ethersStore.resetWallet,
    fetchBalance: ethersStore.fetchBalance,
  }
}

export { shortenAddress }
