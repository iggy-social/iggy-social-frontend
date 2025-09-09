<template>
  <button data-bs-toggle="modal" data-bs-target="#gifModal" class="btn btn-outline-primary me-2 mt-2 btn-sm" title="Add GIF to your post">
    <i class="bi bi-file-earmark-image-fill"></i>
    GIF
  </button>

  <!-- Modal -->
  <div 
    class="modal fade" 
    id="gifModal" 
    aria-labelledby="gifModalLabel" 
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="gifModalLabel">Insert a GIF image</h1>
          <button
            id="closeGifModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="handleCloseClick"
          ></button>
        </div>

        <div class="modal-body">
          <div class="input-group mb-3">
            <input
              v-model="searchTerm"
              v-on:keyup.enter="findGifs"
              type="text"
              class="form-control"
              placeholder="Enter search term"
            />
            <button :disabled="!searchTerm" class="btn btn-primary" type="button" @click="findGifs">Find GIFs</button>
          </div>

          <div class="row row-cols-2 row-cols-md-2">
            <div v-for="gif in gifArray" :key="gif" class="col">
              <img @click="chooseGif(gif)" :src="gif" class="img-thumbnail rounded" alt="..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'TenorGifSearch',
  emits: ['insertGif'],

  data() {
    return {
      clientKey: 'iggy_social_app',
      gifArray: [],
      limit: 10,
      searchTerm: null,
    }
  },

  methods: {
    chooseGif(selectedGif) {
      document.getElementById('closeGifModal').click()
      this.$emit('insertGif', selectedGif)
    },

    async findGifs() {
      this.gifArray = []

      const searchUrl =
        'https://tenor.googleapis.com/v2/search?q=' +
        this.searchTerm +
        '&key=' +
        this.$config.public.tenorApiKey +
        '&client_key=' +
        this.clientKey +
        '&limit=' +
        this.limit +
        '&contentfilter=high&random=true&media_filter=gif'

      const response = await axios.get(searchUrl)
      const data = response.data

      for (let i = 0; i < data.results.length; i++) {
        this.gifArray.push(data.results[i]['media_formats']['gif']['url'])
      }
    },

    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeGifModal')
      if (closeButton) {
        closeButton.blur()
      }
    },
  },
}
</script>
