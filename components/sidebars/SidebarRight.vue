<template>
<Transition name="slide-fade">
  <div v-if="sidebarStore.showRightSidebar" class="p-2 right-col">
    <h3>Right</h3>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, massa at euismod molestie, elit risus congue elit, non 
      hendrerit metus odio id metus.
    </p>
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