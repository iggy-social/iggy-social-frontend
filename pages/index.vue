<template>
  <div class="container mt-4">
    <h1>Connect your wallet:</h1>

    <p>Env var: {{ $config.alchemyPolygonKey }}</p>

    <p>Chain ID 1: {{ $getChainName(1) }}</p>

    <button class="btn btn-primary" @click="open">Connect Wallet</button>

    <button class="btn btn-primary mx-3" @click="smthElse">Smth else</button>

    <vd-board :connectors="connectors" dark />
    {{ address }}
  </div>
</template>

<script>
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useBoard, useEthers } from 'vue-dapp'

export default {
  name: "index",

  methods: {
    smthElse() {
      console.log("smth else")
    }
  },

  setup() {
    const { open } = useBoard()
    const { address } = useEthers()

    const infuraId = ''

    const connectors = [
      new MetaMaskConnector({
        appUrl: 'http://localhost:3000',
      }),
      new WalletConnectConnector({
        qrcode: true,
        rpc: {
          1: `https://mainnet.infura.io/v3/${infuraId}`,
          4: `https://rinkeby.infura.io/v3/${infuraId}`,
        },
      }),
      new CoinbaseWalletConnector({
        appName: 'Vue Dapp',
        jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraId}`,
      }),
    ]

    return { address, connectors, open }
  }
}
</script>