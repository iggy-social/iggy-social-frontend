import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      defaultDomain: null,
      did: null,
      didParent: null,
      followers: 0,
      following: 0,
      lastActivityTimestamp: null,
      orbisImage: null
    }
  },

  getters: {
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

    getLastActivityTimestamp(state) {
      return state.lastActivityTimestamp;
    },

    getOrbisImage(state) {
      return state.orbisImage;
    }
  },

  actions: {
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

    setLastActivityTimestamp(timestamp: any) {
      this.lastActivityTimestamp = timestamp;
    },

    setOrbisImage(image: any) {
      this.orbisImage = image;
    }
  }
})