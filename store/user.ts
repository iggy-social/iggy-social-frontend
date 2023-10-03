import { defineStore } from 'pinia';
import { ethers } from 'ethers';

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      activityPoints: 0, // not in wei
      address: null,
      chatTokenBalanceWei: BigInt(0),
      defaultDomain: null,
      did: null,
      didParent: null,
      followers: 0,
      following: 0,
      isConnectedToOrbis: false,
      lastActivityTimestamp: null,
      lpTokenBalanceWei: BigInt(0),
      orbisImage: null,
      stakeTokenBalanceWei: BigInt(0) // receipt token from the staking contract (aka governance token)
    }
  },

  getters: {
    getCurentUserActivityPoints(state) {
      return state.activityPoints;
    },

    getCurrentUserAddress(state) {
      return state.address;
    },

    getChatTokenBalance(state) {
      const balance = ethers.utils.formatEther(state.chatTokenBalanceWei);

      const formatter = Intl.NumberFormat('en', { notation: 'compact' });

      return formatter.format(Number(balance));
    },

    getChatTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.chatTokenBalanceWei);
    },

    getDefaultDomain(state) {
      return state.defaultDomain;
    },

    getDid(state) {
      return state.did;
    },

    getDidParent(state) {
      return state.didParent;
    },

    getFollowers(state) {
      return state.followers;
    },

    getFollowing(state) {
      return state.following;
    },

    getIsConnectedToOrbis(state) {
      return state.isConnectedToOrbis;
    },

    getLastActivityTimestamp(state) {
      return state.lastActivityTimestamp;
    },

    getLpTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.lpTokenBalanceWei);
    },

    getOrbisImage(state) {
      return state.orbisImage;
    },

    getStakeTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.stakeTokenBalanceWei);
    }
  },

  actions: {
    addToChatTokenBalanceWei(balance: ethers.BigNumber) {
      this.chatTokenBalanceWei += balance.toBigInt();
    },

    addToLpTokenBalanceWei(balance: ethers.BigNumber) {
      this.lpTokenBalanceWei += balance.toBigInt();
    },

    addToStakeTokenBalanceWei(balance: ethers.BigNumber) {
      this.stakeTokenBalanceWei += balance.toBigInt();
    },

    setChatTokenBalanceWei(balance: ethers.BigNumber) {
      this.chatTokenBalanceWei = balance.toBigInt();
    },

    setCurrentUserActivityPoints(points: any) {
      this.activityPoints = points;
    },

    setCurrentUserAddress(address: any) {
      this.address = address;
    },

    setDefaultDomain(domain: any) {
      this.defaultDomain = domain;
    },

    setDid(did: any) {
      this.did = did;
    },

    setDidParent(didParent: any) {
      this.didParent = didParent;
    },

    setFollowers(followers: any) {
      this.followers = followers;
    },

    setFollowing(following: any) {
      this.following = following;
    },

    setIsConnectedToOrbis(isConnected: any) {
      this.isConnectedToOrbis = isConnected;
    },

    setLastActivityTimestamp(timestamp: any) {
      this.lastActivityTimestamp = timestamp;
    },

    setLpTokenBalanceWei(balance: ethers.BigNumber) {
      this.lpTokenBalanceWei = balance.toBigInt();
    },

    setOrbisImage(image: any) {
      this.orbisImage = image;
    },

    setStakeTokenBalanceWei(balance: ethers.BigNumber) {
      this.stakeTokenBalanceWei = balance.toBigInt();
    }

  }
})