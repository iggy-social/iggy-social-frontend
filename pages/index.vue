<template>
  <div class="container mt-4">
    <h1>Connect your wallet:</h1>

    <button class="btn btn-primary" @click="open">Connect Wallet</button>

    <button class="btn btn-primary mx-3" @click="disconnect">Disconnect</button>

    <p class="text-break">{{ address }}</p>

    <div class="row mt-4">
      <div class="col-md-8 offset-md-2">
        <Chat />
      </div>
    </div>
    
    <vd-board :connectors="connectors" dark />
  </div>
</template>

<script>
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector, useBoard, useEthers, useWallet } from 'vue-dapp'

export default {
  name: "index",

  setup() {
    const { open } = useBoard()
    const { address, chainId } = useEthers()
    const { disconnect } = useWallet()

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

    return { address, chainId, connectors, disconnect, open }
  }
}
</script>