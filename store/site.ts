import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSiteStore = defineStore({
  id: 'site',

  state: () => {
    return {
      colorMode: "dark",
    }
  },

  getters: {
    getColorMode(state) {
      const pStorage = useLocalStorage('colorMode', null);

      if (pStorage.value) {
        state.colorMode = pStorage.value;
      }

      return state.colorMode;
    }
  },

  actions: {
    setColorMode(cm: string) {
      this.colorMode = cm;
      localStorage.setItem("colorMode", cm);
    }
  }
})