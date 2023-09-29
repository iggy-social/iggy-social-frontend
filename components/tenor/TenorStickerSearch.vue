<template>
<button data-bs-toggle="modal" data-bs-target="#stickerModal" class="btn btn-outline-primary me-2 mt-2 btn-sm">
  <i class="bi bi-stickies-fill"></i> 
  Sticker
</button>

<!-- Modal -->
<div class="modal fade" id="stickerModal" tabindex="-1" aria-labelledby="stickerModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="stickerModalLabel">Insert a sticker</h1>
        <button id="closestickerModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        <div class="input-group mb-3">
          <input 
            v-model="searchTerm" 
            v-on:keyup.enter="findStickers" 
            type="text" class="form-control" placeholder="Enter search term">
          <button :disabled="!searchTerm" class="btn btn-primary" type="button" @click="findStickers">Find stickers</button>
        </div>

        <div class="row row-cols-2 row-cols-md-2">
          <div v-for="sticker in stickerArray" :key="sticker" class="col">
            <img @click="chooseSticker(sticker)" :src="sticker" class="img-thumbnail rounded" alt="...">
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "TenorStickerSearch",
  emits: ["insertSticker"],

  data()  {
    return {
      clientKey: "iggy_social_app",
      stickerArray: [],
      limit: 10,
      searchTerm: null
    }
  },

  methods: {
    chooseSticker(selectedSticker) {
      document.getElementById('closestickerModal').click();
      this.$emit("insertSticker", selectedSticker);
    },

    async findStickers() {
      this.stickerArray = [];

      const searchUrl = "https://tenor.googleapis.com/v2/search?q=" + this.searchTerm + "&key=" +
            this.$config.tenorApiKey +"&client_key=" + this.clientKey +  "&limit=" + this.limit +
            "&searchfilter=sticker" + "&contentfilter=high" + "&media_filter=png,gif&random=true";

      const response = await fetch(searchUrl);
      const data = await response.json();

      for (let i = 0; i < data.results.length; i++) {
        if (data.results[i]["media_formats"]["png_transparent"]) {
          this.stickerArray.push(data.results[i]["media_formats"]["png_transparent"]["url"]);
        } else {
          this.stickerArray.push(data.results[i]["media_formats"]["gif"]["url"]);
        }
      }
    }
  }
}
</script>