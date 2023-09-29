import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore({
  id: 'notifications',

  state: () => {
    return {
      loadingNotifications: false,
      notifications: [],
      unreadCount: 0
    }
  },

  getters: {
    getLoadingNotifications: state => state.loadingNotifications,
    getNotifications: state => state.notifications,
    getUnreadNotificationsCount: state => state.unreadCount,
  },

  actions: {
    setLoadingNotifications(loading: boolean) {
      this.loadingNotifications = loading;
    },
    
    setNotifications(notifications: any) {
      this.notifications = notifications;
    },

    setUnreadNotificationsCount(unread: number) {
      this.unreadCount = unread;
    }
  }
})