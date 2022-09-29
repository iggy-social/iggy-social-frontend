<template>
<div class="card bg-light mb-3">
  <div class="card-body row">
    <div class="col-1">
      <img v-if="post.creator_details.profile" :src="post.creator_details.profile.pfp" class="img-fluid rounded-circle" />
      <img v-if="!post.creator_details.profile" src="https://img.icons8.com/color/40/000000/guest-female.png" class="img-fluid rounded-circle" />
    </div>

    <div class="col-11">
      <p class="card-subtitle mb-1 text-muted">
        <span v-if="post.creator_details.metadata">{{shortenAddress(post.creator_details.metadata.address)}}</span>
        <span v-if="!post.creator_details.metadata">Anon</span>
        <span v-if="post.timestamp"> · {{timeSince}}</span>
      </p>
      <p class="card-text">{{post.content.body}}</p>
    </div>
  </div>
</div>
</template>

<script>
import { shortenAddress } from 'vue-dapp';

export default {
  name: "BirdieChatPost",
  props: ["post"],

  computed: {
    timeSince() {
      if (!isNaN(this.post.timestamp)) {
        const timePosted = new Date(this.post.timestamp * 1000);
        const now = new Date();
        const secondsPast = (now.getTime() - timePosted.getTime() ) / 1000;

        if(secondsPast < 60){
            return secondsPast + 's';
        }
        if(secondsPast < 3600){
            return parseInt(secondsPast/60) + 'min';
        }
        
        if(secondsPast <= 86400) return parseInt(secondsPast/3600) + 'h';

        if(secondsPast <= 2628000){
            return parseInt(secondsPast/86400) + 'd';
        }
        if(secondsPast <= 31536000){
            return parseInt(secondsPast/2628000) + 'mo';
        }
        if (secondsPast > 31536000) return parseInt(secondsPast/31536000) + 'y';
      }

      return null;
    }
  },

  setup() {
    return { shortenAddress }
  },
}
</script>