<template>
<div class="col col-lg-auto px-0 bg-light">
  <div id="sidebar1" class="collapse collapse-horizontal">
    <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100 bg-light">
      <ul class="nav nav-pills flex-column m-2">
        <li class="nav-item">
          <NuxtLink class="nav-link" :class="$route.path === '/' ? 'active' : ''" aria-current="page" to="/">
            <i class="bi bi-house"></i> Home
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" :class="$route.path.startsWith('/profile') ? 'active' : ''" aria-current="page" to="/profile">
            <i class="bi bi-person"></i> Profile
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link disabled" :class="$route.path.startsWith('/notifications') ? 'active' : ''" aria-current="page" to="/notifications">
            <i class="bi bi-bell"></i> Notifications
          </NuxtLink>
        </li>
      </ul>
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
