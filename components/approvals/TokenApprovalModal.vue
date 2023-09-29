<template>
<div class="modal fade" :id="'tokenApprovalModal'+modalId" tabindex="-1" :aria-labelledby="'tokenApprovalModalLabel'+modalId" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" :id="'tokenApprovalModalLabel'+modalId">Approve {{ token?.symbol }} token</h1>
        <button :id="'closeTokenApprovalModal'+modalId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        Approve {{ token?.symbol }} tokens for swapping:

        <div class="row mt-3">
          <div class="col-lg-8">

            <!-- Unlimited choice -->
            <div class="input-group" @click="selectOption('unlimited')">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="radio" :checked="isUnlimited" />
              </div>

              <input value="Unlimited" type="text" class="form-control" disabled />
            </div>

            <!-- Limited choice -->
            <div class="input-group mt-2" @click="selectOption('limited')">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="radio" :checked="!isUnlimited" />
              </div>

              <input v-model="approvalAmount" type="text" class="form-control" :disabled="waiting" />

              <span class="input-group-text" id="basic-addon2">{{ token?.symbol }}</span>
            </div>
          </div>

        </div>

        <p class="mt-3">
          <small>
            <em>
              If you want to do more swaps without approvals, set a big enough amount or choose unlimited.
            </em>
          </small>
        </p>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="approveToken" :disabled="waiting">
          <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          
          <span v-if="isUnlimited">Approve unlimited</span>
          <span v-if="!isUnlimited">Approve {{ approvalAmount }} {{ token?.symbol }}</span>

        </button>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { ethers } from 'ethers';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import Erc20Abi from "~/assets/abi/Erc20Abi.json";

export default {
  name: 'TokenApprovalModal',
  props: ["amount", "modalId", "routerAddress", "token"],
  emits: ["setApprovalAmount"],

  components: {
    WaitingToast
  },

  data() {
    return {
      waiting: false,
      selectedOption: "unlimited",
      approvalAmount: 0
    }
  },

  mounted() {
    this.approvalAmount = this.amount;
  },

  computed: {
    isUnlimited() {
      return this.selectedOption === "unlimited";
    }
  },

  methods: {
    selectOption(option) {
      this.selectedOption = option;
    },

    async approveToken() {
      this.waiting = true;

      let approvalAmount = this.approvalAmount;

      if (this.isUnlimited) {
        approvalAmount = 10_000_000_000_000_000;
      }

      const amountWei = ethers.utils.parseUnits(String(approvalAmount), this.token.decimals);

      const contract = new ethers.Contract(this.token.address, Erc20Abi, this.signer);

      try {
        const tx = await contract.approve(this.routerAddress, amountWei);

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
          this.toast("You have successfully approved "+this.token.symbol+"!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.$emit("setApprovalAmount", approvalAmount);
          this.waiting = false;
          document.getElementById('closeTokenApprovalModal'+this.modalId).click();
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
        this.toast.error("Something went wrong while approving the token");
        this.waiting = false;
        return;
      }

      this.waiting = false;
    }
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();

    return {
      signer,
      toast
    }
  },

  watch: {
    amount(newVal, oldVal) {
      if (newVal) {
        this.approvalAmount = this.amount;
      }
    }
  }
}
</script>
