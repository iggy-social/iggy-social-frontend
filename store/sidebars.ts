import { defineStore } from 'pinia'

export const useSidebarStore = defineStore({
  id: 'sidebars',

  state: () => {
    return {
      leftSidebar: false,
      mainContent: true,
      rightSidebar: false
    }
  },

  getters: {
    showLeftSidebar: state => state.leftSidebar,
    showMainContent: state => state.mainContent,
    showRightSidebar: state => state.rightSidebar,
  },

  actions: {
    setLeftSidebar(status: boolean) {
      this.leftSidebar = status;
    },

    setMainContent(status: boolean) {
      this.mainContent = status;
    },

    setRightSidebar(status: boolean) {
      this.rightSidebar = status;
    }
  }
})