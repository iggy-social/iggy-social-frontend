<template>
  <p class="text-center">
      No {{ $config.stakingTokenSymbol }}? Add liquidity to the {{ $config.chatTokenSymbol }}-{{ $config.tokenSymbol }} pool below 
      to get some.
    </p>

    <!-- CHAT token field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        {{ $config.chatTokenSymbol }}
      </button>

      <input 
        v-model="depositAmount"
        type="text" 
        class="form-control" 
        placeholder="0.00"
        :disabled="waitingApproval || waitingDeposit"
        @keyup="fetchNativeCoinAmountWithTimeout"
      >

      <button
        @click="setMaxInputTokenAmount" 
        class="btn btn-outline-secondary" 
        type="button" id="button-addon2"
      >
        <small>MAX</small>
      </button>
    </div>

    <!-- Token balance -->
    <small class="text-muted">
      <em>
        Balance: 
        <span class="cursor-pointer hover-color" @click="setMaxInputTokenAmount">
          {{ chatTokenBalance }} {{ $config.chatTokenSymbol }}
        </span>
      </em>
    </small>

    <!-- Native coin field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        {{ $config.tokenSymbol }}
      </button>

      <input 
        v-model="nativeCoinAmount"
        type="text" 
        class="form-control"
        :disabled="ethFieldDisabled"
      >
    </div>

    <!-- 
      TODO: 
      - check native coin balance (if too low, prevent from trying to add liquidity) 
      - check native coin balance already in default layout and store it in user store
    -->

    <div class="d-flex justify-content-center mt-4 mb-4">
      <!-- Approve token button -->
      <button 
        :disabled="waitingApproval"
        v-if="allowanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
        @click="approveToken"
      >
        <span v-if="waitingApproval" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Approve {{ $config.chatTokenSymbol }} token
      </button>

      <!-- Deposit button -->
      <button 
        :disabled="waitingDeposit"
        v-if="!allowanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
        @click="deposit"
      >
        <span v-if="waitingDeposit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Get {{ $config.stakingTokenSymbol }}
      </button>
    </div>

    <p class="text-center">
      <small class="text-center" v-if="allowanceTooLow">
        <em>
          You will need to do 2 transactions: Approve {{ $config.chatTokenSymbol }} token and then Get {{ $config.stakingTokenSymbol }}.
        </em>
      </small>
    </p>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { useUserStore } from '~/store/user';

export default {
  name: 'AddLiquidity',

  data() {
    return {
      allowanceWei: 0,
      debounce: null, // debounce to get ETH amount
      depositAmount: 0,
      ethFieldDisabled: true,
      nativeCoinAmount: 0,
      nativeCoinAmountWei: null,
      timeout: 800, // timeout for debounce in miliseconds
      waitingApproval: false,
      waitingDeposit: false
    }
  },

  components: {
    WaitingToast
  },

  mounted() {
    this.fetchAllowance();
  },

  computed: {
    allowanceTooLow() {
      return Number(this.allowanceWei) < Number(this.depositAmountWei);
    },

    chatTokenBalance() {
      return ethers.utils.formatEther(this.userStore.getChatTokenBalanceWei);
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return 0;
      }

      return ethers.utils.parseEther(String(this.depositAmount));
    }
  },

  methods: {
    async approveToken() {
      this.waitingApproval = true;

      // set up staking token
      const chatTokenInterface = new ethers.utils.Interface([
        "function approve(address spender, uint256 amount) public returns (bool)"
      ]);

      const chatToken = new ethers.Contract(
        this.$config.chatTokenAddress,
        chatTokenInterface,
        this.signer
      );

      try {
        const tx = await chatToken.approve(this.$config.swapRouterAddress, this.depositAmountWei);

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
          this.$emit("updateAllowance", this.depositAmountWei);

          this.toast.dismiss(toastWait);

          this.toast("You have successfully approved tokens. Now proceed with getting LP tokens!", {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.waitingApproval = false;

          this.deposit();
        } else {
          this.toast.dismiss(toastWait);
          this.waitingApproval = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.waitingApproval = false;
      }
    },

    async deposit() {
      this.waitingDeposit = true;

      // add liquidity to the pool
      const routerInterface = new ethers.utils.Interface([
        "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
      ]);

      const routerContract = new ethers.Contract(
        this.$config.swapRouterAddress,
        routerInterface,
        this.signer
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // TODO: get deadline from user's chat settings

      // take nativeCoinAmount instead of nativeCoinAmountWei in case user entered a value in the field 
      // themselves (holds true for the first time, when nativeCoinAmountWei is null)
      const ncAmountWei = ethers.utils.parseEther(String(this.nativeCoinAmount)); 

      // TODO: subtract slippage (from user's chat settings)
      const ncAmountWeiMin = ncAmountWei; 

      // TODO: subtract slippage (from user's chat settings)
      const depositAmountWeiMin = this.depositAmountWei;

      try {
        const tx = await routerContract.addLiquidityETH(
          this.$config.chatTokenAddress,
          this.depositAmountWei, // chat token deposit
          depositAmountWeiMin, // chat token deposit min
          ncAmountWeiMin, // native coin deposit min
          this.address,
          deadline,
          {
            value: ncAmountWei
          }
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: `Adding liquidity to the ${this.$config.chatTokenSymbol}-${this.$config.tokenSymbol} pool...`
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          // TODO: update allowance, chat token balance, native coin balance, and LP tokens balance
          //this.$emit("updateAllowance", 0); // reset allowance

          this.toast.dismiss(toastWait);

          this.toast(`You have successfully provided liquidity and received ${this.$config.stakingTokenSymbol}!`, {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.waitingDeposit = false;
      }
    },

    async fetchAllowance() {
      // check chat token allowance for the iggy router contract
      const chatTokenInterface = new ethers.utils.Interface([
        "function allowance(address owner, address spender) public view returns (uint256)"
      ]);

      const chatTokenContract = new ethers.Contract(
        this.$config.chatTokenAddress,
        chatTokenInterface,
        this.signer
      );

      this.allowanceWei = await chatTokenContract.allowance(
        this.address,
        this.$config.swapRouterAddress
      );
    },

    async fetchNativeCoinAmount() {
      const routerInterface = new ethers.utils.Interface([
        "function calculateETHForLiquidity(address addressToken, uint256 amountToken) external view returns (uint256)"
      ]);

      const routerContract = new ethers.Contract(
        this.$config.swapRouterAddress,
        routerInterface,
        this.signer
      );

      this.nativeCoinAmountWei = await routerContract.calculateETHForLiquidity(
        //"0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
        this.$config.chatTokenAddress,
        ethers.utils.parseEther(String(this.depositAmount))
      );
      
      this.nativeCoinAmount = ethers.utils.formatEther(this.nativeCoinAmountWei);

      if (Number(this.nativeCoinAmountWei) === 0) {
        this.ethFieldDisabled = false;
      } 
    },

    fetchNativeCoinAmountWithTimeout() {
      if (this.debounce) {
        clearTimeout(this.debounce);
      }

      const self = this;

      this.debounce = setTimeout(() => {
        self.fetchNativeCoinAmount();
      }, self.timeout);
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.chatTokenBalance;

      this.fetchNativeCoinAmount();
    },
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return {
      address,
      signer,
      toast,
      userStore
    }
  },
}
</script>