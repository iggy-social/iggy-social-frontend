<template>
<div class="col col-lg-auto px-0 mt-1">
  <div id="sidebar1" class="collapse collapse-horizontal">
    <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100">
      <div class="card m-2 p-2 bg-light">
        <ul class="nav nav-pills flex-column">
          <li class="nav-item p-1">
            <NuxtLink class="nav-link" :class="$route.path === '/' ? 'active' : ''" aria-current="page" to="/">
              <i class="bi bi-house"></i> Home
            </NuxtLink>
          </li>
          <li class="nav-item p-1">
            <NuxtLink class="nav-link" :class="$route.path.startsWith('/profile') ? 'active' : ''" aria-current="page" to="/profile">
              <i class="bi bi-person"></i> Profile
            </NuxtLink>
          </li>
          <li class="nav-item p-1">
            <NuxtLink class="nav-link disabled" :class="$route.path.startsWith('/about') ? 'active' : ''" aria-current="page" to="/about">
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
export default {
  name: "SidebarLeft",

  setup() {
    
  }
}
</script>
