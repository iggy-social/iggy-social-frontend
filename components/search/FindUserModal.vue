<template>
<div class="modal fade" id="findUserModal" tabindex="-1" aria-labelledby="findUserModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="findUserModalLabel">Find user</h1>
        <button id="closeFindUserModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Find user by their domain name:</p>

        <FindUser @closeModal="closeModal" />
      </div>
    </div>
  </div>
</div>
</template>

<script>
import FindUser from '~/components/search/FindUser.vue';

export default {
  name: "FindUserModal",

  components: {
    FindUser
  },

  methods: {
    closeModal() {
      document.getElementById('closeFindUserModal').click();
    }
  }
}
</script>