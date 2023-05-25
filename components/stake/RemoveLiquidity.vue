<template>
  <p class="text-center">
      Remove liquidity and get back {{ $config.chatTokenSymbol }} & {{ $config.tokenSymbol }} tokens.
    </p>

    <!-- CHAT token field -->
    <div class="input-group mt-5">
      <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false" disabled>
        {{ $config.lpTokenSymbol }}
      </button>

      <input 
        v-model="depositAmount"
        type="text" 
        class="form-control" 
        placeholder="0.00"
        :disabled="waitingApproval || waitingDeposit"
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
          {{ lpTokenBalance }} {{ $config.lpTokenSymbol }}
        </span>
      </em>
    </small>

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
        Approve {{ $config.lpTokenSymbol }}
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
        Remove liquidity
      </button>
    </div>

    <p class="text-center">
      <small class="text-center" v-if="allowanceTooLow">
        <em>
          You will need to do 2 transactions: Approve {{ $config.lpTokenSymbol }} and then Remove liquidity.
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
  name: 'RemoveLiquidity',

  data() {
    return {
      allowanceWei: 0,
      debounce: null, // debounce to get ETH amount
      depositAmount: 0,
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

    lpBalanceTooLow() {
      return Number(this.userStore.getLpTokenBalanceWei) < Number(this.depositAmountWei);
    },

    lpTokenBalance() {
      return ethers.utils.formatEther(this.userStore.getLpTokenBalanceWei);
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
      const lpTokenInterface = new ethers.utils.Interface([
        "function approve(address spender, uint256 amount) public returns (bool)"
      ]);

      const lpToken = new ethers.Contract(
        this.$config.lpTokenAddress,
        lpTokenInterface,
        this.signer
      );

      try {
        const tx = await lpToken.approve(this.$config.swapRouterAddress, this.depositAmountWei);

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

          this.toast("You have successfully approved tokens. Now proceed with removing liquidity!", {
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
        "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountToken, uint amountETH)",
        "function calculateETHAndTokensToReceive(address _lpToken, uint256 _lpAmount) external view returns (uint256 amountToken, uint256 amountETH)"
      ]);

      const routerContract = new ethers.Contract(
        this.$config.swapRouterAddress,
        routerInterface,
        this.signer
      );

      // calculate the minimum amount of both native coin and chat token to be received
      const chatETHAmounts = await routerContract.calculateETHAndTokensToReceive(
        this.$config.chatTokenAddress,
        ethers.utils.parseEther(String(this.depositAmount))
      );

      const deadline = Math.floor(Date.now() / 1000) + 60 * this.siteStore.getSwapDeadline; // get deadline from user's chat settings

      // subtract slippage (from user's chat settings)
      const slippageBps = Math.floor(Number(this.siteStore.getSlippage) * 100); // convert to bps
      const ncAmountWeiMin = chatETHAmounts[1].sub(chatETHAmounts[1].div(10000).mul(slippageBps)); // apply slippage
      const tokenAmountWeiMin = chatETHAmounts[0].sub(chatETHAmounts[0].div(10000).mul(slippageBps)); // apply slippage

      console.log("ncAmountWeiMin", Number(ncAmountWeiMin));
      console.log("tokenAmountWeiMin", Number(tokenAmountWeiMin));

      try {
        const tx = await routerContract.removeLiquidityETH(
          this.$config.chatTokenAddress,
          this.depositAmountWei, // LP tokens to burn
          tokenAmountWeiMin, // min amount of chat tokens to receive
          ncAmountWeiMin, // min amount of native coins to receive
          this.address,
          deadline
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: `Removing liquidity from the ${this.$config.lpTokenSymbol}-${this.$config.tokenSymbol} pool...`
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

          this.toast(`You have successfully removed liquidity and received ${this.$config.lpTokenSymbol} & ${this.$config.tokenSymbol}!`, {
            type: "success",
            onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.allowanceWei.sub(this.depositAmountWei); // subtract deposited amount from allowance
          this.userStore.setLpTokenBalanceWei(this.userStore.getLpTokenBalanceWei.sub(this.depositAmountWei)); // subtract deposited amount from chat token balance
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
      const lpTokenInterface = new ethers.utils.Interface([
        "function allowance(address owner, address spender) public view returns (uint256)"
      ]);

      const lpTokenContract = new ethers.Contract(
        this.$config.lpTokenAddress,
        lpTokenInterface,
        this.signer
      );

      this.allowanceWei = await lpTokenContract.allowance(
        this.address,
        this.$config.swapRouterAddress
      );
    },

    setMaxInputTokenAmount() {
      this.depositAmount = this.lpTokenBalance;
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