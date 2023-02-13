<template>
<div class="col col-lg-auto px-0">
  <div id="sidebar1" class="collapse collapse-horizontal border-end">
    <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100 bg-light">
      <ul class="nav nav-pills flex-column m-2">
        <li class="nav-item">
          <NuxtLink class="nav-link active" aria-current="page" to="/"><i class="bi bi-house"></i> Home</NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" aria-current="page" to="/profile"><i class="bi bi-person"></i> Profile</NuxtLink>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled">Disabled</a>
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
