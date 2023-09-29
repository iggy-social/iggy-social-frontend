<template>
<div class="card mb-3 border">
  <div class="card-body row">
    <div class="col-2 col-md-1">
      <NuxtLink :to="'/profile/?id='+getUsernameOrAddress">
        <ProfileImage 
          class="img-fluid rounded-circle"
          :address="authorAddress" 
          :domain="authorDomain"
          :image="authorImage"
          :key="authorAddress"
        />
      </NuxtLink>
    </div>
    
    <div class="col-10 col-md-11">
      <p class="mt-0 link-without-color">
        <NuxtLink class="link-without-color hover-color" :to="'/profile/?id='+getUsernameOrAddress">
          {{ getUsernameOrShortAddress }}
        </NuxtLink>
        
        <span v-if="getNotificationAction === 'reply'">
          <i class="bi bi-chat-dots-fill ms-1 text-primary"></i> replied to your post
        </span>

        <span v-if="getNotificationAction === 'like'">
          <i class="bi bi-heart-fill ms-1 text-primary"></i> liked your post
        </span>
      </p>

      <p class="mb-0 cursor-pointer text-break" @click="openPostDetails">
        {{ getNotificationContent }}
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { shortenAddress } from 'vue-dapp';
import ProfileImage from '../profile/ProfileImage.vue';
import { getDomainName } from '~/utils/domainUtils';
import { fetchUsername, storeUsername } from '~/utils/storageUtils';
import { getTextWithoutBlankCharacters } from '~/utils/textUtils';

export default {
  name: 'OrbisNotification',
  props: ['notification'],

  components: {
    ProfileImage
  },

  data() {
    return {
      authorAddress: null,
      authorDomain: null,
      authorImage: null,
      lengthLimit: 150
    }
  },

  mounted() {
    if (this.notification) {
      this.authorAddress = this.notification["user_notifiying_details"]["did"].split(":")[4];

      // get username from storage
      this.authorDomain = fetchUsername(window, this.authorAddress);

      if (!this.authorDomain && this.notification["user_notifiying_details"]?.profile?.username) {
        this.authorDomain = this.notification["user_notifiying_details"]["profile"]["username"];
      }

      // get image from session storage
      this.authorImage = sessionStorage.getItem(String(this.authorAddress).toLowerCase()+"-img");

      if (!this.authorImage && this.notification["user_notifiying_details"]?.profile?.pfp) {
        this.authorImage = this.notification["user_notifiying_details"]["profile"]["pfp"];
      }

      this.fetchUserDomain();
    }
  },

  computed: {
    getNotificationAction() {
      if (this.notification.family === "reply_to") {
        return "reply";
      } else if (this.notification.family === "reaction" && this.notification.content.type === "like") {
        return "like";
      }

      return "";
    },

    getNotificationContent() {
      if (this.notification?.content?.body) {
        const content = this.notification["content"]["body"];

        if (content.length > this.lengthLimit) {
          return content.substring(0, this.lengthLimit) + "...";
        } else {
          return content;
        }
      } else if (this.notification?.post_details?.content?.body) {
        const content =  this.notification["post_details"]["content"]["body"];

        if (content.length > this.lengthLimit) {
          return content.substring(0, this.lengthLimit) + "...";
        } else {
          return content;
        }
      }

      return "";
    },

    getPostStreamId() {
      if (this.notification?.post_details?.stream_id) {
        return this.notification["post_details"]["stream_id"];
      }

      return null;
    },

    getUsernameOrAddress() {
      if (this.authorDomain) {
        return this.authorDomain;
      } else {
        return this.authorAddress;
      }
    },

    getUsernameOrShortAddress() {
      if (this.notification) {
        this.authorAddress = this.notification["user_notifiying_details"]["did"].split(":")[4];

        // get username from storage
        this.authorDomain = fetchUsername(window, this.authorAddress);

        if (this.authorDomain) {
          return getTextWithoutBlankCharacters(this.authorDomain);
        } else {
          return shortenAddress(this.authorAddress);
        }
      }
    }
  },

  methods: {
    getDomainName,

    async fetchUserDomain() {
      const userDomain = await this.getDomainName(this.authorAddress);

      if (userDomain) {
        this.authorDomain = userDomain;
        storeUsername(window, this.authorAddress, userDomain+this.$config.tldName);
      }
    },

    openPostDetails() {
      this.$router.push({ name: 'post', query: { id: this.getPostStreamId } });
    },
  },

  setup() {
    return { shortenAddress }
  }
}
</script>