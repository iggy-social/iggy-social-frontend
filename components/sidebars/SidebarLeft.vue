<template>
<div class="col col-lg-auto px-0 mt-1">
  <div id="sidebar1" class="collapse collapse-horizontal">
    <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100">
      <div class="card m-2 p-2 bg-light">

        <div v-if="isActivated" class="text-center">

          <NuxtLink to="/profile">
            <ProfileImage 
              :key="userStore.getOrbisImage"
              @click="closeLeftSidebar"
              class="img-fluid mt-3 rounded-circle w-30 sidebar-profile-image" 
              :address="address" :domain="userStore.getDefaultDomain" :image="userStore.getOrbisImage" 
            />
          </NuxtLink>

          <h6 class="mt-3">
            {{ userStore.getDefaultDomain }}
          </h6>

          <hr />
        </div>

        <ul class="nav nav-pills flex-column">
          <li class="nav-item p-1" @click="closeLeftSidebar">
            <NuxtLink class="nav-link" :class="$route.path === '/' ? 'active' : ''" aria-current="page" to="/">
              <i class="bi bi-house"></i> Home
            </NuxtLink>
          </li>
          <li v-if="isActivated" class="nav-item p-1" @click="closeLeftSidebar">
            <NuxtLink class="nav-link" :class="$route.path.startsWith('/profile') ? 'active' : ''" aria-current="page" to="/profile">
              <i class="bi bi-person"></i> Profile
            </NuxtLink>
          </li>
          <li class="nav-item p-1" @click="closeLeftSidebar">
            <NuxtLink class="nav-link" :class="$route.path.startsWith('/about') ? 'active' : ''" aria-current="page" to="/about">
              <i class="bi bi-patch-question"></i> About
            </NuxtLink>
          </li>
        </ul>
      </div>
   </div>
  </div>
</div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { useSidebarStore } from '~/store/sidebars';
import { useUserStore } from '~/store/user';
import ProfileImage from "~/components/profile/ProfileImage.vue";

export default {
  name: "SidebarLeft",
  props: ["lSidebar", "isMobile"],

  components: {
    ProfileImage
  },
  
  methods: {
    closeLeftSidebar() {
      if (this.isMobile) {
        this.lSidebar.hide();
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
      }
    }
  },

  setup() {
    const sidebarStore = useSidebarStore();
    const { address, isActivated } = useEthers();
    const userStore = useUserStore();

    return { address, isActivated, sidebarStore, userStore }
  },
}
</script>
