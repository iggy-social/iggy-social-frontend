<template>
  <Head>
    <Title>Notifications | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Notifications | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3">
        Notifications
        <span v-if="notificationsStore.getLoadingNotifications" class="spinner-border spinner-border-md" role="status" aria-hidden="true"></span>    
        
        <button 
          v-if="notificationsStore.getUnreadNotificationsCount > 0 && !notificationsStore.getLoadingNotifications" 
          class="btn btn-primary btn-sm"
          @click="clearNotifications"
          :disabled="clearingNotifications"
        >
          <i v-if="!clearingNotifications" class="bi bi-trash3-fill"></i>
          <span v-if="clearingNotifications" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </button>
      </h3>

      <div v-for="notification in notificationsStore.getNotifications" :key="notification">
        <OrbisNotification :notification="notification" />
      </div>

      <div v-if="notificationsStore.getUnreadNotificationsCount === 0" class="mt-5 mb-5">
        <p>No unread notifications.</p>
      </div>

    </div>
  </div>
</template>

<script>
import { useNotificationsStore } from '~/store/notifications';
import OrbisNotification from '~/components/notifications/OrbisNotification.vue';
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  name: 'Notifications',

  components: {
    OrbisNotification
  },

  data() {
    return {
      clearingNotifications: false
    }
  },

  methods: {
    async clearNotifications() {
      this.clearingNotifications = true;

      // get current unix timestamp
      let timestampNow = Math.floor(Date.now() / 1000);

      let res = await this.$orbis.setNotificationsReadTime({
        type: "social", 
        timestamp: Number(timestampNow),
        context: this.$config.orbisContext
      });
      
      if (res.status === 200) {
        this.notificationsStore.setNotifications([]);
        this.notificationsStore.setUnreadNotificationsCount(0);
        this.clearingNotifications = false;
      } else { // error
        console.log(res);
        this.toast(res.result, {type: "error"});

        this.clearingNotifications = false;
      }
    }
  },

  setup() {
    const notificationsStore = useNotificationsStore();
    const toast = useToast();

    return { notificationsStore, toast }
  },
}
</script>