<template>
  <span data-bs-toggle="modal" data-bs-target="#connectModal">{{btnText}}</span>
</template>

<script>
export default {
  name: "ConnectWalletButton",
  props: ["btnText"],
}
</script>