import { defineStore } from 'pinia'

export const useSidebarStore = defineStore({
  id: 'sidebars',

  state: () => {
    return {
      leftSidebar: true,
      mainContent: true,
      rightSidebar: true
    }
  },

  getters: {
    showLeftSidebar: state => state.leftSidebar,
    showMainContent: state => state.mainContent,
    showRightSidebar: state => state.rightSidebar,
  },

  actions: {
    setLeftSidebar(status) {
      this.leftSidebar = status;
    },

    setMainContent(status) {
      this.mainContent = status;
    },

    setRightSidebar(status) {
      this.rightSidebar = status;
    }
  }
})