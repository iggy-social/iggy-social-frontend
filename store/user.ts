import { defineStore } from 'pinia'
import { ethers } from 'ethers'

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      activityPoints: 0, // not in wei
      address: null,
      chatTokenBalanceWei: BigInt(0),
      defaultDomain: null,
      lpTokenBalanceWei: BigInt(0),
      image: null,
      stakeTokenBalanceWei: BigInt(0), // receipt token from the staking contract (aka governance token)
    }
  },

  getters: {
    getCurentUserActivityPoints(state) {
      return state.activityPoints
    },

    getCurrentUserAddress(state) {
      return state.address
    },

    getChatTokenBalance(state) {
      const balance = ethers.utils.formatEther(state.chatTokenBalanceWei)

      const formatter = Intl.NumberFormat('en', { notation: 'compact' })

      return formatter.format(Number(balance))
    },

    getChatTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.chatTokenBalanceWei)
    },

    getDefaultDomain(state) {
      return state.defaultDomain
    },

    getImage(state) {
      return state.image
    },

    getLpTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.lpTokenBalanceWei)
    },

    getStakeTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.stakeTokenBalanceWei)
    },
  },

  actions: {
    addToChatTokenBalanceWei(balance: ethers.BigNumber) {
      this.chatTokenBalanceWei += balance.toBigInt()
    },

    addToLpTokenBalanceWei(balance: ethers.BigNumber) {
      this.lpTokenBalanceWei += balance.toBigInt()
    },

    addToStakeTokenBalanceWei(balance: ethers.BigNumber) {
      this.stakeTokenBalanceWei += balance.toBigInt()
    },

    setChatTokenBalanceWei(balance: ethers.BigNumber) {
      this.chatTokenBalanceWei = balance.toBigInt()
    },

    setCurrentUserActivityPoints(points: any) {
      this.activityPoints = points
    },

    setCurrentUserAddress(address: any) {
      this.address = address
    },

    setDefaultDomain(domain: any) {
      this.defaultDomain = domain
    },

    setImage(image: any) {
      this.image = image
    },

    setLpTokenBalanceWei(balance: ethers.BigNumber) {
      this.lpTokenBalanceWei = balance.toBigInt()
    },

    setStakeTokenBalanceWei(balance: ethers.BigNumber) {
      this.stakeTokenBalanceWei = balance.toBigInt()
    },
  },
})
