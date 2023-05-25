<template>
  <p class="text-center">
      No {{ $config.lpTokenSymbol }}? Add liquidity to the {{ $config.chatTokenSymbol }}-{{ $config.tokenSymbol }} pool below 
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

    <!-- Native coin balance -->
    <small class="text-muted">
      <em>
        Balance: 
        <span>
          {{ nativeBalance }} {{ $config.tokenSymbol }}
        </span>
      </em>
    </small>

    <div class="d-flex justify-content-center mt-4 mb-4">
      <!-- Approve token button -->
      <button 
        :disabled="waitingApproval"
        v-if="allowanceTooLow && !nativeBalanceTooLow"
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
        v-if="!allowanceTooLow && !nativeBalanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
        @click="deposit"
      >
        <span v-if="waitingDeposit" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Get {{ $config.lpTokenSymbol }}
      </button>

      <!-- Native balance too low button -->
      <button 
        disabled 
        v-if="nativeBalanceTooLow || chatBalanceTooLow"
        class="btn btn-outline-primary" 
        type="button"
      >
        <span v-if="nativeBalanceTooLow && !chatBalanceTooLow">{{ $config.tokenSymbol }}</span> 
        <span v-if="chatBalanceTooLow">{{ $config.chatTokenSymbol }}</span>
        balance too low
      </button>
    </div>

    <p class="text-center">
      <small class="text-center" v-if="allowanceTooLow">
        <em>
          You will need to do 2 transactions: Approve {{ $config.chatTokenSymbol }} token and then Get {{ $config.lpTokenSymbol }}.
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
import { useSiteStore } from '~/store/site';

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
    if (this.address) {
      this.fetchAllowance();
    }
  },

  computed: {
    allowanceTooLow() {
      return Number(this.allowanceWei) < Number(this.depositAmountWei);
    },

    chatBalanceTooLow() {
      return Number(this.userStore.getChatTokenBalanceWei) < Number(this.depositAmountWei);
    },

    chatTokenBalance() {
      return ethers.utils.formatEther(this.userStore.getChatTokenBalanceWei);
    },

    depositAmountWei() {
      if (!this.depositAmount || Number(this.depositAmount) === 0) {
        return 0;
      }

      return ethers.utils.parseEther(String(this.depositAmount));
    },

    nativeBalance() {
      if (this.balance) {
        const nBal = Number(ethers.utils.formatEther(this.balance));

        if (nBal > 0) {
          return nBal.toFixed(2);
        } else {
          return nBal.toFixed(6);
        }
      }

      return 0;
    },

    nativeBalanceTooLow() {
      if (this.balance) {
        return Number(this.nativeCoinAmountWei) > Number(this.balance);
      }

      return false;
    },
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
          this.allowanceWei = this.depositAmountWei;

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

      const deadline = Math.floor(Date.now() / 1000) + 60 * this.siteStore.getSwapDeadline; // get deadline from user's chat settings

      // take nativeCoinAmount instead of nativeCoinAmountWei in case user entered a value in the field 
      // themselves (holds true for the first time, when nativeCoinAmountWei is null)
      const ncAmountWei = ethers.utils.parseEther(String(this.nativeCoinAmount)); 

      // subtract slippage (from user's chat settings)
      const slippageBps = Math.floor(Number(this.siteStore.getSlippage) * 100); // convert to bps
      const ncAmountWeiMin = ncAmountWei.sub(ncAmountWei.div(10000).mul(slippageBps)); // apply slippage
      const depositAmountWeiMin = this.depositAmountWei.sub(this.depositAmountWei.div(10000).mul(slippageBps)); // apply slippage

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
          this.toast.dismiss(toastWait);

          this.toast(`You have successfully provided liquidity and received ${this.$config.lpTokenSymbol}!`, {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.allowanceWei.sub(this.depositAmountWei); // subtract deposited amount from allowance
          let chatTokenBalanceWei = ethers.utils.parseEther(this.chatTokenBalance);
          this.userStore.setChatTokenBalanceWei(chatTokenBalanceWei.sub(this.depositAmountWei)); // subtract deposited amount from chat token balance
          this.fetchLpTokenBalance();
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

    async fetchLpTokenBalance() {
      // check chat token balance
      const lpTokenInterface = new ethers.utils.Interface([
        "function balanceOf(address account) external view returns (uint256)"
      ]);

      const lpTokenContract = new ethers.Contract(
        this.$config.lpTokenAddress,
        lpTokenInterface,
        this.signer
      );

      this.userStore.setLpTokenBalanceWei(await lpTokenContract.balanceOf(this.address));
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
    const { address, balance, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();
    const siteStore = useSiteStore();

    return {
      address,
      balance,
      signer,
      siteStore,
      toast,
      userStore
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.fetchAllowance();
      }
    },
  }
}
</script>