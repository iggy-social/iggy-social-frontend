<template>
<div class="modal fade" id="changeUsernameModal" tabindex="-1" aria-labelledby="changeUsernameModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="changeUsernameModalLabel">Change your username</h1>
        <button id="closeChangeUsernameModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Enter your new main username (you must own it):</p>

        <div class="input-group mb-3">
          <input 
            type="text" 
            class="form-control text-end" 
            placeholder="enter name" 
            v-model="domainName"
          >
          <span class="input-group-text">{{$config.tldName}}</span>
        </div>

        <p v-if="domainNotValid.invalid && domainNotValid.message" class="text-danger">
          <small>
            <i class="bi bi-exclamation-octagon"></i> {{ domainNotValid.message }}
          </small>
        </p>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

        <button 
          type="button" 
          :disabled="loading || domainNotValid.invalid"
          class="btn btn-primary" 
          @click="changeUsername"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          Submit
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
import { useUserStore } from '~/store/user';
import { getDomainName } from '~/utils/domainUtils';
import { storeUsername } from '~/utils/storageUtils';

export default {
  name: 'ChangeUsernameModal',

  data() {
    return {
      domainName: null,
      loading: false,
    }
  },

  computed: {
    domainNotValid() {
      if (this.domainName === "") {
        return {invalid: true, message: null};
      } else if (this.domainName === null) {
        return {invalid: true, message: null};
      } else if (this.domainName.includes(".")) {
        return {invalid: true, message: "Dots not allowed"};
      } else if (this.domainName.includes(" ")) {
        return {invalid: true, message: "Spaces not allowed"};
      } else if (this.domainName.includes("%")) {
        return {invalid: true, message: "% not allowed"};
      } else if (this.domainName.includes("&")) {
        return {invalid: true, message: "& not allowed"};
      } else if (this.domainName.includes("?")) {
        return {invalid: true, message: "? not allowed"};
      } else if (this.domainName.includes("#")) {
        return {invalid: true, message: "# not allowed"};
      } else if (this.domainName.includes("/")) {
        return {invalid: true, message: "/ not allowed"};
      } else if (this.domainName.includes(",")) {
        return {invalid: true, message: "Comma not allowed"};
      } else if (
        this.domainName.includes("\\") || 
        this.domainName.includes("­") || 
        this.domainName.includes("	") || 
        this.domainName.includes("͏") || 
        this.domainName.includes("؜") || 
        this.domainName.includes("܏") || 
        this.domainName.includes("ᅟ") || 
        this.domainName.includes("ᅠ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("឴") || 
        this.domainName.includes("឵") || 
        this.domainName.includes("᠎") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("​") || 
        this.domainName.includes("‌") || 
        this.domainName.includes("‍") || 
        this.domainName.includes("‎") || 
        this.domainName.includes("‏") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("⁠") || 
        this.domainName.includes("⁡") || 
        this.domainName.includes("⁢") || 
        this.domainName.includes("⁣") || 
        this.domainName.includes("⁤") || 
        this.domainName.includes("⁪") || 
        this.domainName.includes("⁫") || 
        this.domainName.includes("⁬") || 
        this.domainName.includes("⁭") || 
        this.domainName.includes("⁮") || 
        this.domainName.includes("⁯") || 
        this.domainName.includes("　") || 
        this.domainName.includes("⠀") || 
        this.domainName.includes("ㅤ") || 
        this.domainName.includes("ﾠ") || 
        this.domainName.includes("𑂱") || 
        this.domainName.includes("𛲠") || 
        this.domainName.includes("𛲡") || 
        this.domainName.includes("𛲢") || 
        this.domainName.includes("𛲣") || 
        this.domainName.includes("𝅙") || 
        this.domainName.includes("𝅳") || 
        this.domainName.includes("𝅴") || 
        this.domainName.includes("𝅵") || 
        this.domainName.includes("𝅶") || 
        this.domainName.includes("𝅷") || 
        this.domainName.includes("𝅸") || 
        this.domainName.includes("𝅹") || 
        this.domainName.includes("𝅺") || 
        this.domainName.includes("") || 
        this.domainName.includes("") || 
        this.domainName.includes("")
      ) {
        return {invalid: true, message: "This character is not allowed"};
      }

      return {invalid: false, message: "Domain name is valid"};
    }, 
  }, 

  methods: {
    getDomainName,

    async changeUsername() {
      this.loading = true;

      if (this.isActivated && !this.domainNotValid.invalid) {
        const tldInterface = new ethers.utils.Interface([
          "function editDefaultDomain(string calldata _domainName) external"
        ]);

        const tldContract = new ethers.Contract(this.$config.punkTldAddress, tldInterface, this.signer);

        try {
          const tx = await tldContract.editDefaultDomain(
            this.domainName.toLowerCase(), // domain name
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
            this.fetchUserDomain(); // update the main username in this app
            this.toast("You have successfully changed your username!", {
              type: "success",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            this.loading = false;
            document.getElementById('closeChangeUsernameModal').click();
          } else {
            this.toast.dismiss(toastWait);
            this.toast("Transaction has failed.", {
              type: "error",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            this.loading = false;
            console.log(receipt);
          }

        } catch (e) {
          console.log("error: " + e);
          this.toast("Error: " + e, {type: "error"});
          this.loading = false;
          return;
        }
      }
    },

    async fetchUserDomain() {
      if (this.isActivated) {
        let userDomain;

        if (this.signer) {
          userDomain = await this.getDomainName(this.address, this.signer);
        } else {
          userDomain = await this.getDomainName(this.address);
        }

        if (userDomain) {
          this.userStore.setDefaultDomain(userDomain+this.$config.tldName);
          storeUsername(window, this.address, userDomain+this.$config.tldName);
        } else {
          this.userStore.setDefaultDomain(null);
        }
      }
    },
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return { address, isActivated, signer, toast, userStore };
  }
}
</script>