<template>
<div class="modal fade" :id="'swapTokensModal'+modalId" tabindex="-1" :aria-labelledby="'swapTokensModalLabel'+modalId" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" :id="'swapTokensModalLabel'+modalId">Swap tokens</h1>
        <button :id="'closeSwapTokensModal'+modalId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        <p>Double-check the swap amounts:</p>

        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">{{ inputToken?.symbol }}</span>
          <input type="text" class="form-control" :value="inputTokenAmount" disabled>
        </div>

        <h4 class="text-center mt-2">
          <i class="bi bi-arrow-down"></i>
        </h4>

        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">{{ outputToken?.symbol }}</span>
          <input type="text" class="form-control" :value="outputTokenAmount" disabled>
        </div>

        <small v-if="!bothTokensAreNativeCoinOrWrappedToken">
          <em>
            You will get at least {{ outputTokenAmount }} {{ outputToken?.symbol }}, but probably more 
            ({{ siteStore.getSlippage }}% slippage).
          </em>
        </small>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="swap" :disabled="waiting">
          <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          Swap tokens
        </button>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import wrappedNativeTokens from "~/assets/data/wrappedNativeTokens.json";
import { swapTokens } from '~/utils/simpleSwapUtils';
import WaitingToast from "~/components/WaitingToast";
import { useSiteStore } from '~/store/site';
import { fetchReferrer } from '~/utils/storageUtils';

export default {
  name: "SwapTokensModal",
  props: ["inputToken", "inputTokenAmount", "modalId", "outputToken", "outputTokenAmount", "outputTokenAmountWei", "routerAddress"],
  emits: ["changeInputTokenBalance"],

  data() {
    return {
      waiting: false,
    };
  },

  components: {
    WaitingToast
  },

  computed: {
    bothTokensAreNativeCoinOrWrappedToken() {
      if (
        (this.inputIsNativeCoin && this.outputIsWrappedNativeCoin) || 
        (this.inputIsWrappedNativeCoin && this.outputIsNativeCoin)
      ) {
        return true;
      } else {
        return false;
      }
    },

    inputIsNativeCoin() {
      if (String(this.inputToken?.address).toLowerCase() == String(ethers.constants.AddressZero).toLowerCase()) {
        return true;
      } else {
        return false;
      }
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

    outputIsWrappedNativeCoin() {
      if (String(this.outputToken?.address).toLowerCase() == String(wrappedNativeTokens[this.$config.supportedChainId]).toLowerCase()) {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {

    async swap() {
      this.waiting = true;

      const inputTokenAmountWei = ethers.utils.parseUnits(this.inputTokenAmount, this.inputToken?.decimals);

      try {
        const tx = await swapTokens(
          this.signer,
          this.address,
          this.inputToken,
          this.outputToken,
          inputTokenAmountWei,
          this.outputTokenAmountWei,
          this.routerAddress,
          fetchReferrer(window)
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
          this.toast("You have successfully swapped "+this.inputToken.symbol+" for "+ this.outputToken.symbol +"!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.$emit("changeInputTokenBalance");
          this.waiting = false;
          document.getElementById('closeSwapTokensModal'+this.modalId).click();
        } else {
          this.waiting = false;
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }

      } catch (e) {
        this.toast.error("Something went wrong while swapping tokens");
        this.waiting = false;
        return;
      }

      this.waiting = false;
    },
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();
    const siteStore = useSiteStore();

    return { address, signer, siteStore, toast }
  },
}
</script>