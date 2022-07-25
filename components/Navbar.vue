<template>
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">Punk Starter</NuxtLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <div class="d-flex ms-auto" >
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item">
              <NuxtLink class="nav-link active" aria-current="page" to="/">Home page</NuxtLink>
            </li>

            <li class="nav-item">
              <NuxtLink class="nav-link" to="/profile">Profile page</NuxtLink>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar"
}
</script>