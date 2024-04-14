<template>
  <div>

    <div class="mb-3">
      <div class="input-group">
        <span v-if="hasBlankCharacter" class="input-group-text" id="basic-addon3"><i class="bi bi-exclamation-triangle-fill"></i></span>
        <input 
          v-model="inputReceiver" 
          type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3 basic-addon4" 
          placeholder="Enter recipient's domain name or address"
          @keyup="findBlankCharacter"
        />
      </div>

      <div class="form-text" id="basic-addon4" v-if="hasBlankCharacter">
        <i class="bi bi-exclamation-triangle-fill"></i>
        This domain name contains a blank character: {{ encodeURIComponent(inputReceiver) }}. Proceed with caution.
      </div>
    </div>

    <!-- Input token -->
    <div class="input-group mb-1 mt-3">
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

    <!-- BUTTONS -->
    <div class="d-flex justify-content-center mt-4">

      <!-- Connect Wallet button -->
      <ConnectWalletButton v-if="!isActivated" class="btn btn-outline-primary" btnText="Connect wallet" />

      <!-- Disabled Send tokens button (if not input amount is entered) -->
      <button
        v-if="isActivated && !inputTokenAmount && isSupportedChain"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Send tokens
      </button>

      <!-- Send tokens button -->
      <button
        v-if="isActivated && inputTokenAmount && inputAmountLessThanBalance && isSupportedChain"
        :disabled="waiting || !inputToken || !inputTokenAmount || !isActivated || !inputAmountLessThanBalance || !inputReceiver || !isSupportedChain" 
        class="btn btn-outline-primary" 
        type="button"
        @click="send"
      >
        <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
        Send tokens
      </button>

      <!-- Balance too low button -->
      <button
        v-if="isActivated && inputTokenAmount && !inputAmountLessThanBalance && isSupportedChain"
        :disabled="true" 
        class="btn btn-outline-primary" 
        type="button"
      >
        Balance too low
      </button>

      <!-- Wrong network button -->
      <SwitchChainButton v-if="isActivated && !isSupportedChain" />

    </div>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import { getTokenBalance } from '~/utils/balanceUtils';
import { hasTextBlankCharacters } from '~/utils/textUtils';
import WaitingToast from "~/components/WaitingToast";
import ConnectWalletButton from '~/components/ConnectWalletButton.vue';
import SwitchChainButton from '~/components/SwitchChainButton.vue';
import Erc20Abi from "~/assets/abi/Erc20Abi.json";

export default {
  name: 'SendTokensComponent',
  props: ["recipient", "tokens"],

  data() {
    return {
      filterTextInput: '',
      hasBlankCharacter: false,
      inputReceiver: null,
      inputToken: null,
      inputTokenAmount: null,
      inputTokenBalance: null,
      recipientAddress: null,
      tokenList: [],
      waiting: false
    }
  },

  components: {
    ConnectWalletButton,
    SwitchChainButton
  },

  mounted() {
    this.inputReceiver = this.recipient;
    this.processRecipient(this.recipient);

    this.findBlankCharacter();

    this.tokenList = this.tokens.tokens;
    this.selectInputToken(this.tokenList[0]);
  },

  computed: {

    filteredTokensInput() {
      const regex = new RegExp(this.filterTextInput, 'i');
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

    isSupportedChain() {
      return this.chainId == this.$config.supportedChainId;
    }

  },

  methods: {
    getTokenBalance, // imported from balance utils
    hasTextBlankCharacters, // imported from text utils

    findBlankCharacter() {
      this.hasBlankCharacter = false;
      this.hasBlankCharacter = hasTextBlankCharacters(this.inputReceiver);
    },

    async processRecipient(recipient) {
      if (recipient) {
        if (ethers.utils.isAddress(recipient)) {
          this.recipientAddress = recipient;
        } else {
          const domainName = String(recipient).trim().toLowerCase().replace(this.$config.tldName, "");

          // fetch provider from hardcoded RPCs
          let provider = this.$getFallbackProvider(this.$config.supportedChainId);

          if (this.isActivated && this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's MetaMask
            provider = this.signer;
          }

          const tldInterface = new ethers.utils.Interface([
            "function getDomainHolder(string) view returns (address)"
          ]);

          const tldContract = new ethers.Contract(this.$config.punkTldAddress, tldInterface, provider);

          this.recipientAddress = await tldContract.getDomainHolder(domainName);
        }
      }
    },

    async selectInputToken(token) {
      this.inputToken = token;
      this.inputTokenAmount = null;

      if (this.signer) {
        this.inputTokenBalance = await this.getTokenBalance(token, this.address, this.signer);
      }
    },

    async send() {
      // if recipient includes a dot, check if it ends with tldName. If not, throw error via toast
      if (this.inputReceiver.includes(".")) {
        if (!this.inputReceiver.endsWith(this.$config.tldName)) {
          return this.toast.error("Invalid domain name. Only " + this.$config.tldName + " domains are supported.");
        }
      }

      this.waiting = true;

      await this.processRecipient(this.inputReceiver);

      // prevent sending to 0x0 address
      if (this.recipientAddress == ethers.constants.AddressZero) {
        this.waiting = false;
        return this.toast.error("This domain name does not exist");
      }

      // check if sending native coin or ERC-20 token
      if (this.inputToken.address == ethers.constants.AddressZero) {
        this.sendNativeCoin();
      } else {
        this.sendErc20Tokens();
      }
    },

    async sendErc20Tokens() {
      const tokenContract = new ethers.Contract(this.inputToken.address, Erc20Abi, this.signer);

      try {
        const tx = await tokenContract.transfer(
          this.recipientAddress,
          ethers.utils.parseUnits(this.inputTokenAmount, this.inputToken.decimals)
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully sent " + String(this.inputTokenAmount) + " " + this.inputToken.symbol + " to " + this.inputReceiver, {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.subtractInputTokenBalance();

          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waiting = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      }
    },

    async sendNativeCoin() {
      const tokenContract = new ethers.Contract(this.inputToken.address, Erc20Abi, this.signer);

      try {
        const tx = await this.signer.sendTransaction({
          to: this.recipientAddress,
          value: ethers.utils.parseUnits(this.inputTokenAmount, this.inputToken.decimals)
        });

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully sent " + String(this.inputTokenAmount) + " " + this.inputToken.symbol + " to " + this.inputReceiver, {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.subtractInputTokenBalance();

          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waiting = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace('execution reverted:', "Error:");

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waiting = false;
      }
    },

    setMaxInputTokenAmount() {
      this.inputTokenAmount = String(this.inputTokenBalance);
    },

    subtractInputTokenBalance() {
      this.inputTokenBalance = Number(this.inputTokenBalance) - Number(this.inputTokenAmount);
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();

    return { address, chainId, isActivated, signer, toast };
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