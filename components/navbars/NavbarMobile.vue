<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-mobile">
    <div class="container-fluid">
      <button @click="toggleLeftSidebar" class="nav-item btn navbar-toggler nav-btn-left" type="button">
        <span v-if="!sidebarStore.showLeftSidebar" class="navbar-toggler-icon"></span>
        <span v-if="sidebarStore.showLeftSidebar" class="bi bi-x-lg"></span>
      </button>

      <NuxtLink class="navbar-brand mx-auto" to="/">
        <img src="/img/logo.svg" alt="Chat logo" height="40">
      </NuxtLink>

      <button @click="toggleRightSidebar" class="nav-item btn navbar-toggler nav-btn-right" type="button">
        <span v-if="!sidebarStore.showRightSidebar" class="navbar-toggler-icon"></span>
        <span v-if="sidebarStore.showRightSidebar" class="bi bi-x-lg"></span>
      </button>
    </div>
    </nav>
</template>

<script>
import { useSidebarStore } from '~/store/sidebars';

export default {
  name: "NavbarMobile",
  props: ["lSidebar", "rSidebar"],

  methods: {
    toggleLeftSidebar() {
      this.sidebarStore.setRightSidebar(false);
      //this.rSidebar.hide();

      if (this.sidebarStore.showLeftSidebar) {
        this.sidebarStore.setLeftSidebar(false);
        this.lSidebar.hide();
        this.sidebarStore.setMainContent(true);
      } else {
        this.sidebarStore.setLeftSidebar(true);
        this.lSidebar.show();
        this.sidebarStore.setMainContent(false);
      }
    },

    toggleRightSidebar() {
      this.lSidebar.hide();
      this.sidebarStore.setLeftSidebar(false);

      if (this.sidebarStore.showRightSidebar) {
        this.sidebarStore.setRightSidebar(false);
        //this.rSidebar.hide();
        this.sidebarStore.setMainContent(true);
      } else {
        this.sidebarStore.setRightSidebar(true);
        //this.rSidebar.show();
        this.sidebarStore.setMainContent(false);
      }
    }
  },

  setup() {
    const sidebarStore = useSidebarStore();
    return { sidebarStore }
  },
}
</script>