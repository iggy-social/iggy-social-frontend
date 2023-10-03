<template>
  <div>

    <table class="table bg-transparent text-center">
      <thead>
        <tr>
          <th class="bg-transparent" scope="col">Domain</th>
          <th class="bg-transparent" scope="col">Key price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="domain in domainObjects" :key="domain.name">
          <td class="bg-transparent text-break">{{ domain.name }}{{ $config.tldName }}</td>
          <td class="bg-transparent text-nowrap">{{ domain.price }} {{ $config.tokenSymbol }}</td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex justify-content-center mb-3" v-if="waiting">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';

export default {
  name: 'KeysList',

  data() {
    return {
      featuredKeys: this.$config.keysFeatured,
      domainObjects: [],
      waiting: false
    }
  },

  mounted() {
    this.getKeysPrices();
  },

  methods: {
    formatPrice(priceWei) {
      const price = Number(ethers.utils.formatEther(priceWei));

      if (price > 1) {
        return price.toFixed(2);
      } else if (price > 0.1) {
        return price.toFixed(4);
      } else if (price > 0.01) {
        return price.toFixed(5);
      } else if (price > 0.001) {
        return price.toFixed(6);
      } else if (price > 0.0001) {
        return price.toFixed(7);
      } else if (price > 0.00001) {
        return price.toFixed(8);
      } else if (price > 0.000001) {
        return price.toFixed(9);
      } else {
        return price;
      }
    },

    async getKeysPrices() {
      this.waiting = true;
      this.domainObjects = [];

      const keysInterface = new ethers.utils.Interface([
        "function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"
      ]);

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      const keysContract = new ethers.Contract(
        this.$config.keysAddress,
        keysInterface,
        provider
      );

      for (let i = 0; i < this.featuredKeys.length; i++) {
        const domainName = this.featuredKeys[i];

        const priceWei = await keysContract.getBuyPriceAfterFee(domainName, 1);

        this.domainObjects.push({ name: domainName, price: this.formatPrice(priceWei) });
      }

      // filter from the highest price to the lowest
      this.domainObjects.sort((a, b) => (Number(a.price) < Number(b.price)) ? 1 : -1);

      this.waiting = false;
    }
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();

    return {
      address,
      chainId,
      isActivated,
      signer
    }
  },
}
</script>