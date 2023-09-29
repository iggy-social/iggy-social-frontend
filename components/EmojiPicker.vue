<template>
  <button data-bs-toggle="modal" data-bs-target="#emojiModal" class="btn btn-outline-primary me-2 mt-2 btn-sm">
    <i class="bi bi-emoji-smile-fill"></i>
  </button>

  <div class="modal fade" id="emojiModal" tabindex="-1" aria-labelledby="emojiModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="emojiModalLabel">Pick an Emoji</h1>
          <button id="closeEmojiModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <EmojiMartPicker
            :data="emojiIndex"
            set="apple"
            title="Pick an emoji"
            emoji="point_up"
            @select="handleEmojiSelect"
            class="emoji-mart-category mx-auto"
            :style="{ backgroundColor: '#222529', color: '#FFFFFF' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EmojiIndex } from 'emoji-mart-vue-fast/src/utils/emoji-data'
import EmojiMartPicker from 'emoji-mart-vue-fast/src/components/Picker'

import data from 'emoji-mart-vue-fast/data/apple.json'

export default {
  name: 'EmojiPickerWithModal',
  components: {
    EmojiMartPicker,
  },
  emits: ['updateEmoji'],

  setup(props, context) {
    const emojiIndex = new EmojiIndex(data)

    const handleEmojiSelect = (emoji) => {
      document.getElementById('closeEmojiModal').click();
      context.emit('updateEmoji', emoji.native);
    }

    return {
      emojiIndex,
      handleEmojiSelect
    }
  },
}
</script>
