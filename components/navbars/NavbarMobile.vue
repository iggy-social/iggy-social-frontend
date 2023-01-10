<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-primary navbar-mobile">
    <div class="container-fluid">
      <button @click="toggleLeftSidebar" class="nav-item btn navbar-toggler nav-btn-left" type="button">
        <span class="navbar-toggler-icon"></span>
      </button>

      <span class="navbar-brand mx-auto">{{$config.projectName}}</span>

      <button @click="toggleRightSidebar" class="nav-item btn navbar-toggler nav-btn-right" type="button">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
    </nav>
</template>

<script>
import { useSidebarStore } from '~/store/sidebars';

export default {
  name: "NavbarMobile",

  methods: {
    toggleLeftSidebar() {
      this.sidebarStore.setRightSidebar(false);

      if (this.sidebarStore.showLeftSidebar) {
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
      } else {
        this.sidebarStore.setLeftSidebar(true);
        this.sidebarStore.setMainContent(false);
      }
    },

    toggleRightSidebar() {
      this.sidebarStore.setLeftSidebar(false);

      if (this.sidebarStore.showRightSidebar) {
        this.sidebarStore.setRightSidebar(false);
        this.sidebarStore.setMainContent(true);
      } else {
        this.sidebarStore.setRightSidebar(true);
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