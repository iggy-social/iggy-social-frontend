import { defineStore } from 'pinia';

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      defaultDomain: null,
    }
  },

  getters: {
    getDefaultDomain(state) {
      return state.defaultDomain;
    }
  },

  actions: {
    setDefaultDomain(domain) {
      this.defaultDomain = domain;
    }
  }
})