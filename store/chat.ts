import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useChatStore = defineStore({
  id: 'chat',

  state: () => {
    return {
      selectedTagIndex: 0 // index number of the selected ta objectg in the tag array (see orbisCategories in nuxt.config.ts)
    }
  },

  getters: {
    getSelectedTagIndex(state) {
      const pStorage = useLocalStorage('selectedTagIndex', 0);

      if (pStorage.value) {
        state.selectedTagIndex = pStorage.value;
      }

      return state.selectedTagIndex;
    }
  },

  actions: {
    setSelectedTagIndex(tagIndex: number) {
      this.selectedTagIndex = tagIndex;
      localStorage.setItem("selectedTagIndex", String(tagIndex));
    }
  }
})