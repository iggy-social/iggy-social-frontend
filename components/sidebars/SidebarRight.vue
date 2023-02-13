<template>
<div class="col-auto col-lg-3 px-0">
  <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
    <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

      <div class="card m-2">
        <div class="card-header">Songbird Community</div>
        <div class="card-body">
          <p class="card-text">
            This is a chat for {{$config.tldName}} domain holders. Get yourself a {{$config.tldName}} domain on 
            <a href="https://songbird.domains" target="_blank">Songbird Domains</a>.
          </p>
        </div>
      </div>

      <div class="card m-2">
        <div class="card-header">Swap</div>
        <div class="card-body">

          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="0.0" aria-describedby="swap-token-1" disabled>
            <span class="input-group-text" id="swap-token-1">USDC</span>
          </div>

          <p class="text-center"><i class="bi bi-arrow-down-up"></i></p>

          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="0.0" aria-describedby="swap-token-2" disabled>
            <span class="input-group-text" id="swap-token-2">ETH</span>
          </div>

          <button class="btn btn-outline-primary mt-2 mb-2" disabled>Swap</button>
        </div>
      </div>
    </div>
  </div>
</div>
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