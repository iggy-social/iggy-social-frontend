<template>
  <div class="card m-2 bg-light">
    <div class="card-header bg-light">Featured Friend Keys</div>
  
    <div class="card-body sidebar-card-body">
  
      <KeysList />

      <div class="d-flex justify-content-center mt-4">
        <NuxtLink class="btn btn-outline-primary" to="/keys">Get a Friend Key</NuxtLink>
      </div>
  
    </div>
  </div>
  </template>
  
  <script>
  import { useEthers } from 'vue-dapp';
  import KeysList from '~/components/keys/KeysList.vue';
  
  export default {
    name: "KeysListWidget",
  
    components: { KeysList },

    setup() {
    const { isActivated } = useEthers();

    return { isActivated }
  },
  }
  </script>