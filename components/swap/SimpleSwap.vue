<template>
  <div>

    <!-- Input token -->
    <div class="input-group mb-1">
      <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ inputToken?.symbol }}
      </button>

      <ul class="dropdown-menu p-2">
        <input 
          class="form-control mb-2" 
          placeholder="Filter tokens"
          v-model="filterTextInput" 
        />

        <li v-for="token in filteredTokensInput" :key="token.address" class="cursor-pointer">
          <span @click="selectInputToken(token)" class="dropdown-item">{{ token.symbol }} ({{ token.name }})</span>
        </li>
      </ul>

      <input 
        v-model="inputTokenAmount"
        type="text" 
        class="form-control" 
        placeholder="0.00"
        @keyup="getOutputAmountWithTimeout"
      >

      <button
        @click="setMaxInputTokenAmount" 
        class="btn btn-outline-secondary" 
        type="button" id="button-addon2"
      >
        <small>MAX</small>
      </button>
    </div>

    <small @click="setMaxInputTokenAmount">
      <em>Balance: </em>  
      <em class="cursor-pointer hover-color">
        {{ formatInputTokenBalance }} {{ inputToken?.symbol }}
      </em>
    </small>

    <!-- Arrow down -->
    <h4 
      @click="getOutputAmount" 
      class="text-center mt-2 cursor-pointer"
    >
      <i class="bi bi-arrow-down"></i>
    </h4>

    <!-- Output token -->
    <div class="input-group mt-4">
      <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {{ outputToken?.symbol }}
      </button>

      <ul class="dropdown-menu p-2">
        <input 
          class="form-control mb-2" 
          placeholder="Filter tokens"
          v-model="filterTextOutput" 
        />

        <li v-for="token in filteredTokensOutput" :key="token.address" class="cursor-pointer">
          <span @click="selectOutputToken(token)" class="dropdown-item">{{ token.symbol }} ({{ token.name }})</span>
        </li>
      </ul>

      <input
        type="text" 
        class="form-control" 
        :value="outputTokenAmount"
        :placeholder="outputText"
        disabled
      >

      <!--
      <button @click="getOutputAmount" class="btn btn-outline-secondary" type="button">
        <small>Get amount</small>
      </button>
      -->
    </div>

    <small 
      v-if="outputTokenAmount && !bothTokensAreNativeCoinOrWrappedTokenOrSame"
    >
      <em>
        You will get at least {{ outputTokenAmount }} {{ outputToken.symbol }}, but probably more 
        ({{ siteStore.getSlippage }}% slippage).
      </em>
    </small>

    <!-- BUTTONS -->
    <div class="d-flex justify-content-center mt-4">

      <!-- Connect Wallet button -->
      <ConnectWalletButton v-if="!isActivated" class="btn btn-outline-primary" btnText="Connect wallet" />

      <!-- Disabled Swap tokens button (if not input amount is entered) -->
      <button
        v-if="isActivated && !inputTokenAmount"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Swap tokens
      </button>

      <!-- Approve token button -->
      <button
        v-if="isActivated && inputTokenAmount && inputAmountLessThanBalance && !bothTokensAreTheSame && allowanceTooLow && !unwrappingWrappedNativeCoin && !priceImpactTooHigh" 
        class="btn btn-outline-primary" 
        type="button"
        data-bs-toggle="modal" 
        :data-bs-target="'#tokenApprovalModal'+swapId"
      >
        Approve token
      </button>

      <!-- Approve token modal -->
      <TokenApprovalModal 
        :modalId="swapId"
        :token="inputToken"
        :amount="inputTokenAmount"
        :routerAddress="routerAddress"
        @setApprovalAmount="changeInputTokenAllowance"
      />

      <!-- Swap tokens button (and fetch the output token amount again) -->
      <button
        v-if="isActivated && inputTokenAmount && inputAmountLessThanBalance && !bothTokensAreTheSame && !priceImpactTooHigh && !priceImpactTooHigh && (!allowanceTooLow || unwrappingWrappedNativeCoin)"
        :disabled="!inputToken || !outputToken || !inputTokenAmount || !outputTokenAmount || !isActivated || bothTokensAreTheSame || !inputAmountLessThanBalance" 
        class="btn btn-outline-primary" 
        type="button"
        data-bs-toggle="modal" 
        :data-bs-target="'#swapTokensModal'+swapId"
        @click="getOutputAmount"
      >
        Swap tokens
      </button>

      <!-- Swap tokens modal -->
      <SwapTokensModal 
        :modalId="swapId" 
        :inputToken="inputToken" 
        :inputTokenAmount="inputTokenAmount" 
        :outputToken="outputToken" 
        :outputTokenAmount="outputTokenAmount"
        :outputTokenAmountWei="outputTokenAmountWei"
        :routerAddress="routerAddress"
        @changeInputTokenBalance="subtractInputTokenBalance"
      />

      <!-- Balance too low button -->
      <button
        v-if="isActivated && inputTokenAmount && !inputAmountLessThanBalance && !bothTokensAreTheSame && !priceImpactTooHigh"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Balance too low
      </button>

      <!-- Both tokens are the same button -->
      <button
        v-if="isActivated && inputTokenAmount && bothTokensAreTheSame && !priceImpactTooHigh"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Both tokens are the same
      </button>

      <!-- Price impact too high -->
      <button
        v-if="isActivated && inputTokenAmount && priceImpactTooHigh"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Price impact too high
      </button>

    </div>

    <p class="text-center mt-4" v-if="poweredBy">
      <small>
        <em>Powered by {{ poweredBy }}.</em>
      </small>
    </p>

  </div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import wrappedNativeTokens from "~/assets/data/wrappedNativeTokens.json";
import { getTokenAllowance, getTokenBalance } from '~/utils/balanceUtils';
import { getOutputTokenAmount, getPriceImpactBps } from '~/utils/simpleSwapUtils';
import { ethers } from 'ethers';
import ConnectWalletButton from '~/components/ConnectWalletButton.vue';
import TokenApprovalModal from '~/components/approvals/TokenApprovalModal.vue';
import SwapTokensModal from '~/components/swap/SwapTokensModal.vue';
import { useSiteStore } from '~/store/site';

export default {
  name: 'SimpleSwap',
  props: ["outputPlaceholder", "poweredBy", "routerAddress", "swapId", "tokens"],

  data() {
    return {
      debounce: null, // debounce for getOutputAmount
      filterTextInput: '',
      filterTextOutput: '',
      inputToken: null,
      inputTokenAllowance: 0,
      inputTokenAmount: null,
      inputTokenBalance: null,
      outputText: "0", // "Click Get amount",
      outputToken: null,
      outputTokenAmountWei: null,
      preswapCheck: false,
      priceImpact: 0,
      timeout: 800, // timeout for getOutputAmount in miliseconds
      tokenList: []
    }
  },

  components: {
    ConnectWalletButton,
    SwapTokensModal,
    TokenApprovalModal
  },

  mounted() {
    this.tokenList = this.getFilteredTokens(this.tokens.tokens);

    this.selectInputToken(this.tokenList[0]);
    this.selectOutputToken(this.tokenList[1]);

    if (this.outputPlaceholder) {
      this.outputText = this.outputPlaceholder;
    }
  },

  computed: {
    allowanceTooLow() {
      if (Number(this.inputTokenAllowance) < Number(this.inputTokenAmount)) {
        return true;
      } else {
        return false;
      }
    },

    bothTokensAreNativeCoinOrWrappedTokenOrSame() {
      if (
        (this.inputToken.address == ethers.constants.AddressZero && this.outputToken.address == wrappedNativeTokens[this.$config.supportedChainId]) || 
        (this.inputToken.address == wrappedNativeTokens[this.$config.supportedChainId] && this.outputToken.address == ethers.constants.AddressZero) || 
        (this.inputToken.address == ethers.constants.AddressZero && this.outputToken.address == ethers.constants.AddressZero) || 
        (this.inputToken.address == wrappedNativeTokens[this.$config.supportedChainId] && this.outputToken.address == wrappedNativeTokens[this.$config.supportedChainId])
      ) {
        return true;
      } else if (this.inputToken.address == this.outputToken.address) {
        return true;
      } else {
        return false;
      }
    },

    bothTokensAreTheSame() {
      if (this.inputToken.address == this.outputToken.address) {
        return true;
      } else {
        return false;
      }
    },

    filteredTokensInput() {
      const regex = new RegExp(this.filterTextInput, 'i');
      return this.tokenList.filter(token => regex.test(token.symbol));
    },

    filteredTokensOutput() {
      const regex = new RegExp(this.filterTextOutput, 'i');
      return this.tokenList.filter(token => regex.test(token.symbol));
    },

    formatInputTokenBalance() {
      if (this.inputTokenBalance) {
        if (this.inputTokenBalance == 0) {
          return 0;
        } else if (this.inputTokenBalance > 100) {
          return Number(this.inputTokenBalance).toFixed(2);
        } else {
          return Number(this.inputTokenBalance).toFixed(4);
        }
      }

      return 0;
    },

    inputAmountLessThanBalance() {
      if (this.inputTokenAmount && this.inputTokenBalance) {
        if (Number(this.inputTokenAmount) <= Number(this.inputTokenBalance)) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    },

    inputIsWrappedNativeCoin() {
      if (String(this.inputToken?.address).toLowerCase() == String(wrappedNativeTokens[this.$config.supportedChainId]).toLowerCase()) {
        return true;
      } else {
        return false;
      }
    },

    outputIsNativeCoin() {
      if (String(this.outputToken?.address).toLowerCase() == String(ethers.constants.AddressZero).toLowerCase()) {
        return true;
      } else {
        return false;
      }
    },

    outputTokenAmount() {
      if (this.outputTokenAmountWei) {
        let amount = ethers.utils.formatUnits(String(this.outputTokenAmountWei), this.outputToken.decimals);

        if (amount == 0) {
          return 0;
        } else if (amount > 100) {
          return Number(amount).toFixed(2);
        } else {
          return Number(amount).toFixed(4);
        }
      }

      return null;
    },

    priceImpactTooHigh() {
      if (this.priceImpact > this.$config.swapPriceImpactMaxBps) {
        return true;
      }
      
      return false;
    },

    unwrappingWrappedNativeCoin() {
      if (this.inputIsWrappedNativeCoin && this.outputIsNativeCoin) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    // imported from utils
    getTokenAllowance,
    getTokenBalance,

    changeInputTokenAllowance(newAllowance) {
      this.inputTokenAllowance = Number(newAllowance);
    },

    getFilteredTokens(tokensArray) {
      // only include tokens that have swap: true
      return tokensArray.filter(token => token.swap);
    },

    // custom
    async getOutputAmount() {
      /*
      if (!this.inputTokenAmount) {
        this.toast.error("Please enter an amount");
        return;
      }
      */

      
      if (this.inputTokenAmount) {
        // get output amount
        if (this.bothTokensAreNativeCoinOrWrappedTokenOrSame) {
          this.outputTokenAmountWei = ethers.utils.parseUnits(this.inputTokenAmount, this.inputToken.decimals);
        } else {
          const outputWei = await getOutputTokenAmount(this.signer, this.inputToken, this.outputToken, this.inputTokenAmount, this.routerAddress);
          
          // deduct slippage
          const slippageBps = Math.floor(Number(this.siteStore.getSlippage) * 100);
          this.outputTokenAmountWei = outputWei.sub(outputWei.div(10000).mul(slippageBps)); // apply slippage
        }

        // get price impact (in bps)
        this.priceImpact = await getPriceImpactBps(this.signer, this.inputToken, this.outputToken, this.inputTokenAmount, this.routerAddress);
      } else {
        this.outputTokenAmountWei = null;
      }
    },

    getOutputAmountWithTimeout() {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      const self = this;

      this.debounce = setTimeout(() => {
        self.getOutputAmount();
      }, self.timeout);
    },

    async selectInputToken(token) {
      this.inputTokenAllowance = 0; // reset the allowance each time a new token is selected
      this.outputTokenAmountWei = null;

      this.inputToken = token;
      this.inputTokenAmount = null;

      if (this.signer) {
        this.inputTokenBalance = await this.getTokenBalance(token, this.address, this.signer);
      }

      if (token.address == ethers.constants.AddressZero) {
        this.inputTokenAllowance = Number(ethers.constants.MaxUint256);
      } else {
        this.inputTokenAllowance = await this.getTokenAllowance(token, this.address, this.routerAddress, this.signer);
      }
    },

    selectOutputToken(token) {
      this.outputToken = token;
      this.outputTokenAmountWei = null;
    },

    setMaxInputTokenAmount() {
      this.inputTokenAmount = String(this.inputTokenBalance);

      this.getOutputAmount();
    },

    subtractInputTokenBalance() {
      this.inputTokenBalance = Number(this.inputTokenBalance) - Number(this.inputTokenAmount);
    },

    togglePreswapCheck() {
      this.preswapCheck = !this.preswapCheck;
    }
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const siteStore = useSiteStore();

    return { address, isActivated, signer, siteStore };
  },

  watch: {
    async isActivated() {
      if (this.address) {
        this.inputTokenBalance = await this.getTokenBalance(this.inputToken, this.address, this.signer);
      }
    }
  }
}
</script>