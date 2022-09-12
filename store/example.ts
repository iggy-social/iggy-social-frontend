import { defineStore } from 'pinia'

export const useExampleStore = defineStore({
  id: 'example',

  state: () => {
    return {
      exampleNum: 1337,
    }
  },

  getters: {
    getExampleNum: state => state.exampleNum,
  },

  actions: {
    changeNum() {
      this.exampleNum = 69420;
    }
  }
})