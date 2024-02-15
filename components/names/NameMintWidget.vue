<template>
<div class="card m-2 bg-light">
  <div class="card-header bg-light">Get a {{$config.tldName}} name</div>

  <div class="card-body sidebar-card-body">
    <p>
      Get yourself a {{$config.tldName}} username and start chatting with other community members.
    </p>
    
    <div class="input-group mb-3">
      <input 
        type="text" 
        class="form-control text-end" 
        placeholder="enter name" 
        aria-describedby="mint-name"
        v-model="domainName"
      >
      <span class="input-group-text" id="mint-name">{{$config.tldName}}</span>
    </div>

    <p v-if="domainNotValid.invalid && domainNotValid.message" class="text-danger">
      <small>
        <i class="bi bi-exclamation-octagon"></i> {{ domainNotValid.message }}
      </small>
    </p>

    <p>
      Minting price: {{ getNamePrice }} {{ $config.tokenSymbol }}
    </p>

    <div class="text-center">
      <button v-if="isActivated" class="btn btn-outline-primary mt-2 mb-2" :disabled="paused || domainNotValid.invalid || balanceTooLow">
        <span v-if="loadingMint || loadingData" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
        <span v-if="loadingData">Loading data...</span>
        <span v-if="!loadingMint && !loadingData && balanceTooLow">Balance too low</span>
        <span v-if="!loadingMint && !loadingData && !balanceTooLow" @click="mintName">Mint username</span>
      </button>
    </div>

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
import { useUserStore } from '~/store/user';
import { getDomainName } from '~/utils/domainUtils';
import { fetchReferrer, fetchUsername, storeUsername } from '~/utils/storageUtils';

export default {
  name: 'NameMintWidget',

  data() {
    return {
      domainName: null,
      isMinter: false,
      loadingData: false,
      loadingMint: false,
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

  mounted() {
    this.fetchDomainData();
  },

  computed: {
    balanceTooLow() {
      const balanceEth = ethers.utils.formatEther(this.balance);
      return Number(balanceEth) < Number(this.getNamePrice);
    },

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

    getNamePrice() {
      if (this.$config.punkNumberOfPrices === 1) {
        return this.price;
      } else if (this.domainName) {
        if (this.domainName.match(/./gu).length === 1) {
          return this.price1char;
        } else if (this.domainName.match(/./gu).length === 2) {
          return this.price2char;
        } else if (this.domainName.match(/./gu).length === 3) {
          return this.price3char;
        } else if (this.domainName.match(/./gu).length === 4) {
          return this.price4char;
        } else if (this.domainName.match(/./gu).length >= 5) {
          return this.price5char;
        } else {
          return this.price5char;
        }
      } else {
        return this.price5char;
      }
    }
  },

  methods: {
    getDomainName, // imported from ~/utils/domainUtils.js

    async fetchDomainData() {
      this.loadingData = true;

      this.isMinter = this.$config.punkMinterAddress !== "";

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

      if (this.isMinter) {
        contractAddress = this.$config.punkMinterAddress;
      } else {
        contractAddress = this.$config.punkTldAddress;
      }

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      const contract = new ethers.Contract(contractAddress, contractInterface, provider);

      // fetch paused status
      if (this.isMinter) {
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
      if (this.isMinter) {
        this.referralFee = await contract.referralFee();
      } else {
        this.referralFee = await contract.referral();
      }

      this.loadingData = false;
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

    async mintName() {
      this.loadingMint = true;

      if (this.isActivated && !this.domainNotValid.invalid) {
        const tldInterface = new ethers.utils.Interface([
          "function getDomainHolder(string) view returns (address)"
        ]);

        const tldContract = new ethers.Contract(this.$config.punkTldAddress, tldInterface, this.signer);

        // check if name is already taken
        let domainHolder = await tldContract.getDomainHolder(this.domainName.toLowerCase());

        if (domainHolder !== ethers.constants.AddressZero) {
          this.toast("This name is already taken", {type: "error"});
          this.loadingMint = false;
          return;
        }

        try {
          const mintInterface = new ethers.utils.Interface([
            "function mint(string memory _domainName, address _domainHolder, address _referrer) external payable returns(uint256)"
          ]);

          let contractAddress;

          if (this.isMinter) {
            contractAddress = this.$config.punkMinterAddress;
          } else {
            contractAddress = this.$config.punkTldAddress;
          }

          const contract = new ethers.Contract(contractAddress, mintInterface, this.signer);

          const tx = await contract.mint(
            this.domainName.toLowerCase(), // domain name
            this.address, // domain receiver
            fetchReferrer(window), // referrer
          {
            value: ethers.utils.parseUnits(this.getNamePrice, this.$config.tokenDecimals)
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
            this.fetchUserDomain();
            this.toast("You have successfully minted a name!", {
              type: "success",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            this.loadingMint = false;
          } else {
            this.toast.dismiss(toastWait);
            this.toast("Transaction has failed.", {
              type: "error",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            this.loadingMint = false;
            console.log(receipt);
          }

        } catch (e) {
          console.log("error: " + e);
          this.toast("Error: " + e, {type: "error"});
          this.loadingMint = false;
          return;
        }
      }
    }
  }, 

  setup() {
    const { address, balance, isActivated, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return { address, balance, isActivated, signer, toast, userStore };
  }
}
</script>