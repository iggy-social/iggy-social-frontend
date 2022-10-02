import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      defaultDomain: null,
      did: null,
      didParent: null
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
    }
  },

  actions: {
    setDefaultDomain(domain) {
      this.defaultDomain = domain;
    },

    setDid(did) {
      this.did = did;
    },

    setDidParent(didParent) {
      this.didParent = didParent;
    }
  }
})