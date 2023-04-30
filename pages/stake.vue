<template>
  <Head>
    <Title>Stake</Title>
    <Meta property="og:title" content="Stake" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs nav-fill">

        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="currentTab === 'deposit' ? 'active' : ''" 
            @click="changeCurrentTab('deposit')" 
          >Deposit</button>
        </li>

        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="currentTab === 'claim' ? 'active' : ''" 
            @click="changeCurrentTab('claim')" 
          >Claim</button>
        </li>

        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="currentTab === 'withdraw' ? 'active' : ''" 
            @click="changeCurrentTab('withdraw')" 
          >Withdraw</button>
        </li>

      </ul>
      <!-- END Tabs Navigation -->

      <!-- Tabs Content -->
      <div class="tab-content mt-3">

        <!-- Deposit Tab -->
        <div v-if="currentTab === 'deposit'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <StakingDeposit 
                :loadingStakingData="loadingStakingData"
                :minDepositWei="minDepositWei" 
                :maxDepositWei="maxDepositWei" 
                :stakingContractAddress="$config.stakingContractAddress" 
                :stakingTokenAddress="$config.stakingTokenAddress" 
                :stakingTokenBalanceWei="stakingTokenBalanceWei"
                :stakingTokenAllowanceWei="stakingTokenAllowanceWei" 
                :stakingTokenDecimals="stakingTokenDecimals" 
                @subtractBalance="subtractBalance" 
                @updateAllowance="updateAllowance" 
              />
            </div>
          </div>
        </div>

        <!-- Claim Tab -->
        <div v-if="currentTab === 'claim'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <StakingClaim 
                :loadingStakingData="loadingStakingData"
              />
            </div>
          </div>
        </div>

        <!-- Withdraw Tab -->
        <div v-if="currentTab === 'withdraw'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <StakingWithdrawal 
                :loadingStakingData="loadingStakingData" 
                :lockedTimeLeft="lockedTimeLeft" 
                :minDepositWei="minDepositWei" 
                :stakingContractAddress="$config.stakingContractAddress" 
                :stakingTokenAddress="$config.stakingTokenAddress" 
                :stakingTokenDecimals="stakingTokenDecimals" 
                :stakingTokenSymbol="$config.stakingTokenSymbol" 
                :receiptTokenBalanceWei="receiptTokenBalanceWei" 
                @addBalance="addBalance"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import StakingClaim from '~/components/stake/StakingClaim.vue';
import StakingDeposit from '~/components/stake/StakingDeposit.vue';
import StakingWithdrawal from '~/components/stake/StakingWithdrawal.vue';

export default {
  name: 'Stake',

  data() {
    return {
      claimAmount: 0, // how much rewards can user claim
      currentTab: "deposit",
      loadingStakingData: false,
      lockedTimeLeft: 0, // in seconds
      minDepositWei: 0,
      maxDepositWei: 0,
      receiptTokenBalanceWei: 0,
      stakingTokenAllowanceWei: 0,
      stakingTokenBalanceWei: 0,
      stakingTokenDecimals: 18
    }
  },

  components: {
    StakingClaim,
    StakingDeposit,
    StakingWithdrawal
  },

  mounted() {
    // get current tab from localStorage
    this.currentTab = localStorage.getItem("stakeCurrentTab");

    if (!this.currentTab) {
      this.currentTab = "deposit";
    }

    if (this.address) {
      this.fetchStakingData();
    }
  },

  methods: {
    addBalance(aBalance) { // staking token balance
      this.stakingTokenBalanceWei += aBalance;
    },

    changeCurrentTab(tab) {
      this.currentTab = tab;
      localStorage.setItem("stakeCurrentTab", tab);
    },

    async fetchStakingData() {
      this.loadingStakingData = true;

      // set up staking contract (which is also receipt token contract)
      const stakingContractInterface = new ethers.utils.Interface([
        "function balanceOf(address _owner) public view returns (uint256)",
        "function getLockedTimeLeft(address _user) external view returns (uint256)",
        "function minDeposit() external view returns (uint256)",
        "function maxDeposit() external view returns (uint256)",
        "function previewClaim(address _claimer) public view returns (uint256)"
      ]);

      const stakingContract = new ethers.Contract(
        this.$config.stakingContractAddress,
        stakingContractInterface,
        this.signer
      );

      // set up staking token
      const stakingTokenInterface = new ethers.utils.Interface([
        "function allowance(address _owner, address _spender) public view returns (uint256)",
        "function balanceOf(address _owner) public view returns (uint256)",
        "function decimals() public view returns (uint8)"
      ]);

      const stakingToken = new ethers.Contract(
        this.$config.stakingTokenAddress,
        stakingTokenInterface,
        this.signer
      );

      // fetch previewClaim
      this.claimAmount = await stakingContract.previewClaim(this.address);

      // fetch staking token balance
      this.stakingTokenBalanceWei = await stakingToken.balanceOf(this.address);

      // fetch staking token approved amount for the staking contract
      this.stakingTokenAllowanceWei = await stakingToken.allowance(
        this.address,
        this.$config.stakingContractAddress
      );

      // fetch receipt token balance
      this.receiptTokenBalanceWei = await stakingContract.balanceOf(this.address);

      // fetch getLockedTimeLeft
      this.lockedTimeLeft = await stakingContract.getLockedTimeLeft(this.address);

      // fetch staking token decimals
      // this.stakingTokenDecimals = await stakingToken.decimals();

      // fetch minDeposit
      this.minDepositWei = await stakingContract.minDeposit();

      // fetch maxDeposit
      this.maxDepositWei = await stakingContract.maxDeposit();

      this.loadingStakingData = false;
    },

    subtractBalance(subBalance) { // staking token balance
      this.stakingTokenBalanceWei -= subBalance;
    },

    updateAllowance(newAllowance) {
      this.stakingTokenAllowanceWei = newAllowance;
    }
  },

  setup() {
    const { address, signer } = useEthers();

    return { address, signer }
  },

  watch: {
    address() {
      this.fetchStakingData();
    }
  }
}
</script>