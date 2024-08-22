<template>
<div class="card border mt-3">
  <div class="card-body">

    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs nav-fill">
      <li class="nav-item" v-if="aUrl">
        <button 
          class="nav-link" 
          :class="currentTab === 'audio' ? 'active' : ''" 
          @click="currentTab = 'audio'" 
        >Audio</button>
      </li>

      <li class="nav-item" v-if="vUrl">
        <button 
          class="nav-link" 
          :class="currentTab === 'video' ? 'active' : ''" 
          @click="currentTab = 'video'" 
        >Video</button>
      </li>

      <li class="nav-item" v-if="yUrl">
        <button 
          class="nav-link" 
          :class="currentTab === 'youtube' ? 'active' : ''" 
          @click="currentTab = 'youtube'" 
        >YouTube</button>
      </li>
    </ul>

    <!-- Tabs Content -->
    <div class="tab-content mt-3 d-flex justify-content-center">

      <!-- Audio Player Tab -->
      <div class="col-12 col-lg-8" v-if="currentTab === 'audio' && aUrl">
        <p class="text-center mt-3">
          <audio class="ratio ratio-16x9" controls>
            <source :src="aUrl" :type="aFormat">
            Your browser does not support mp3 audio player.
          </audio>
        </p>
      </div>

      <!-- Video player Tab -->
      <div class="col-12 col-lg-8" v-if="currentTab === 'video' && vUrl">
        <video class="ratio ratio-16x9 rounded" controls>
          <source :src="vUrl" :type="vFormat">
          Your browser does not support mp4 video player.
        </video>
      </div>

      <!-- YouTube Tab -->
      <div class="col-12 col-lg-8" v-if="currentTab === 'youtube' && yUrl">
        <span v-html="youtubeParsing(yUrl)"></span>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import { getWorkingUrl } from '~/utils/ipfsUtils';
import { youtubeParsing } from '~/utils/textUtils';

export default {
  name: 'CollectionMediaSection',
  props: ["audioUrl", "videoUrl", "youtubeUrl"],

  data() {
    return {
      aFormat: null,
      aUrl: null,
      currentTab: "audio",
      vFormat: null,
      vUrl: null,
      yUrl: null
    };
  },

  mounted() {
    this.fetchMetadata();
  },

  methods: {
    youtubeParsing,

    async fetchMetadata() {
      try {
        if (this.youtubeUrl) {
          this.yUrl = this.youtubeUrl;
        }

        if (this.audioUrl) {
          const result = await getWorkingUrl(this.audioUrl);
          if (result) {
            this.aUrl = result.url;
            this.aFormat = result.format;
          }
        }

        if (this.videoUrl) {
          const result = await getWorkingUrl(this.videoUrl);
          if (result) {
            this.vUrl = result.url;
            this.vFormat = result.format;
          }
        }
      } catch (e) {
        console.log(e);
      }

      if (this.yUrl) {
        this.currentTab = "youtube";
      } else if (this.aUrl) {
        this.currentTab = "audio";
      } else if (this.vUrl) {
        this.currentTab = "video";
      }
    },
  },
}
</script>