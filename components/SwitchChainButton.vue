<template>
<!-- Button -->
<button v-if="!navbar && !dropdown" class="btn btn-primary" @click="changeNetwork($getChainName($config.supportedChainId))">
  Switch to {{ $getChainName($config.supportedChainId) }}
</button>

<!-- Button with dropdown -->
<div v-if="!navbar && dropdown" class="dropdown">
  <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    {{ showChainName }}
  </button>
  <div class="dropdown-menu">
    <span class="dropdown-item cursor-pointer" @click="changeNetwork($getChainName($config.supportedChainId))">
      Switch to {{ $getChainName($config.supportedChainId) }}
    </span>
  </div>
</div>

<!-- Navbar link with dropdown -->
<li v-if="navbar && dropdown" class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
    {{ showChainName }}
  </a>
  <div class="dropdown-menu dropdown-menu-end">
    <span class="dropdown-item cursor-pointer" @click="changeNetwork($getChainName($config.supportedChainId))">
      Switch to {{ $getChainName($config.supportedChainId) }}
    </span>
  </div>
</li>
</template>

<script>
import { useEthers } from 'vue-dapp';

export default {
  name: "SwitchChainButton",
  props: ["dropdown", "navbar"],

  computed: {
    showChainName() {
      if (this.chainId === this.$config.supportedChainId) {
        return this.$getChainName(this.$config.supportedChainId);
      } else {
        return "Unsupported network";
      }
    },
  },

  methods: {
    changeNetwork(networkName) {
      const networkData = this.$switchChain(networkName); 
      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    },
  },

  setup() {
    const { chainId } = useEthers();
    return { chainId }
  },
}
</script>
