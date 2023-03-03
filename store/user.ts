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
    setDefaultDomain(domain: any) {
      this.defaultDomain = domain;
    },

    setDid(did: any) {
      this.did = did;
    },

    setDidParent(didParent: any) {
      this.didParent = didParent;
    }
  }
})