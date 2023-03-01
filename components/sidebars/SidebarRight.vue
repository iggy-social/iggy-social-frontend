<template>
<div class="col-auto col-lg-3 px-0 mt-1">
  <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
    <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

      <NameMintWidget />

      <div class="card m-2 bg-light">
        <div class="card-header bg-light">Swap</div>
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
import NameMintWidget from '~/components/names/NameMintWidget.vue';

export default {
    name: "SidebarRight",

    components: { 
      NameMintWidget 
    },

    setup() {
        const sidebarStore = useSidebarStore();
        return { sidebarStore };
    }
}
</script>