<template>
  <div>
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control text-end"
        placeholder="enter name"
        aria-describedby="find-user"
        v-model="domainName"
        v-on:keyup.enter="redirectToProfile"
      />
      <span class="input-group-text" id="find-user">{{ $config.public.tldName }}</span>
    </div>

    <p v-if="validateDomainName(domainName).invalid && validateDomainName(domainName).message" class="text-danger">
      <small> <i class="bi bi-exclamation-octagon"></i> {{ validateDomainName(domainName).message }} </small>
    </p>

    <div class="text-center">
      <button class="btn btn-primary mt-2 mb-2" :disabled="validateDomainName(domainName).invalid" @click="redirectToProfile">
        Find User
      </button>
    </div>
  </div>
</template>

<script>
import { validateDomainName } from '@/utils/domainUtils'

export default {
  name: 'FindUser',
  emit: ['closeModal'],

  data() {
    return {
      domainName: null,
    }
  },

  methods: {
    redirectToProfile() {
      this.$router.push({ path: '/profile', query: { id: this.domainName + this.$config.public.tldName } })
      this.$emit('closeModal')
    },
  },
}
</script>
