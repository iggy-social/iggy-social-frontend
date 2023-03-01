<template>
<div class="card m-2 bg-light">
  <div class="card-header bg-light">Mint a {{$config.tldName}} name</div>

  <div class="card-body">
    
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="enter name" aria-describedby="mint-name">
      <span class="input-group-text" id="mint-name">{{$config.tldName}}</span>
    </div>

    <p>
      Minting price: {{ price }} {{ $config.tokenSymbol }}
    </p>

    <button v-if="isActivated" class="btn btn-outline-primary mt-2 mb-2" :disabled="paused">
      <span v-if="loadingData">Loading data...</span>
      <span v-else>Mint name</span>
    </button>

    <ConnectWalletButton v-if="!isActivated" class="btn btn-outline-primary mt-2 mb-2" btnText="Connect Wallet" />
    
  </div>
</div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { ethers } from 'ethers';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import ConnectWalletButton from "~/components/ConnectWalletButton";

export default {
  name: 'NameMintWidget',

  data() {
    return {
      loadingData: false,
      paused: true,
      price: null,
      price1char: null,
      price2char: null,
      price3char: null,
      price4char: null,
      price5char: null
    }
  },

  components: { 
    ConnectWalletButton,
    WaitingToast
  },

  created() {
    this.fetchDomainData();
  },

  methods: {
    async fetchDomainData() {
      this.loadingData = true;

      let isMinter = this.$config.punkMinterAddress !== "";

      const contractInterface = new ethers.utils.Interface([
        "function buyingEnabled() view returns (bool)", // TLD-specific function
        "function paused() view returns (bool)", // minter-specific function
        "function price() view returns (uint256)",
        "function price1char() view returns (uint256)",
        "function price2char() view returns (uint256)",
        "function price3char() view returns (uint256)",
        "function price4char() view returns (uint256)",
        "function price5char() view returns (uint256)",
        "function referral() view returns (uint256)", // TLD-specific function
        "function referralFee() view returns (uint256)" // minter-specific function
      ]);

      let contractAddress;

      if (isMinter) {
        contractAddress = this.$config.punkMinterAddress;
      } else {
        contractAddress = this.$config.punkTldAddress;
      }

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      const contract = new ethers.Contract(contractAddress, contractInterface, provider);

      // fetch paused status
      if (isMinter) {
        this.paused = await contract.paused();
      } else {
        this.paused = !await contract.buyingEnabled();
      }

      // fetch price(s)
      if (this.$config.punkNumberOfPrices === 1) {
        this.price = ethers.utils.formatUnits(await contract.price(), this.$config.tokenDecimals);
      } else if (this.$config.punkNumberOfPrices === 5) {
        this.price1char = ethers.utils.formatUnits(await contract.price1char(), this.$config.tokenDecimals);
        this.price2char = ethers.utils.formatUnits(await contract.price2char(), this.$config.tokenDecimals);
        this.price3char = ethers.utils.formatUnits(await contract.price3char(), this.$config.tokenDecimals);
        this.price4char = ethers.utils.formatUnits(await contract.price4char(), this.$config.tokenDecimals);
        this.price5char = ethers.utils.formatUnits(await contract.price5char(), this.$config.tokenDecimals);
      }

      // fetch referral fee
      if (isMinter) {
        this.referralFee = await contract.referralFee();
      } else {
        this.referralFee = await contract.referral();
      }

      this.loadingData = false;
    }
  }, 

  setup() {
    const { address, isActivated } = useEthers();

    return { address, isActivated };
  }
}
</script>