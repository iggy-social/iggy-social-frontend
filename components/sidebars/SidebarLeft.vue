<template>
<Transition name="slide-left">
  <div v-if="sidebarStore.showLeftSidebar" class="p-2 left-col">
    <div class="d-grid gap-2">
      <NuxtLink class="btn btn-outline-primary" to="/">Home</NuxtLink>
      <NuxtLink class="btn btn-outline-primary disabled" to="/profile">Notifications</NuxtLink>
      <NuxtLink class="btn btn-outline-primary disabled" to="/profile">Explore</NuxtLink>
      <NuxtLink class="btn btn-outline-primary" to="/profile">Profile</NuxtLink>
      <NuxtLink class="btn btn-outline-primary disabled" to="/profile">Messages</NuxtLink>
    </div>
  </div>
</Transition>
</template>

<script>
import { useSidebarStore } from '~/store/sidebars';

export default {
  name: "SidebarLeft",

  setup() {
    const sidebarStore = useSidebarStore();
    return { sidebarStore }
  }
}
</script>