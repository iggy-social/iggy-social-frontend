<template>
<Transition name="slide-right">
  <div v-if="sidebarStore.showRightSidebar" class="p-2 right-col">

    <div class="card bg-light mb-3">
      <div class="card-header">{{$config.tldName}} domains</div>
      <div class="card-body">
        <h4 class="card-title">{{$config.tldName}} domains chat</h4>
        <p class="card-text">
          This is a chat for {{$config.tldName}} domain holders. Get yourself a {{$config.tldName}} domain on 
          Punk Domains (on Optimism).
        </p>

        <a class="btn btn-outline-primary mt-2 mb-2" href="https://punk.domains" target="_blank">Go to Punk Domains</a>
      </div>
    </div>
  </div>

</Transition>
</template>

<script>
import { useSidebarStore } from '~/store/sidebars';

export default {
  name: "SidebarRight",

  setup() {
    const sidebarStore = useSidebarStore();
    return { sidebarStore }
  }
}
</script>