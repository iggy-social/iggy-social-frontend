<template>
  <Head>
    <Title>Stake</Title>
    <Meta property="og:title" content="Stake" />
  </Head>

  <div class="card border">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
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
                @clearClaimAmount="clearClaimAmount" 
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
                :claimAmountWei="claimAmountWei" 
                :claimRewardsTotalWei="claimRewardsTotalWei" 
                :futureRewardsWei="futureRewardsWei" 
                :lastClaimPeriod="lastClaimPeriod" 
                :minDepositWei="minDepositWei" 
                :periodLength="periodLength" 
                :receiptTokenBalanceWei="receiptTokenBalanceWei" 
                :stakingContractAddress="$config.stakingContractAddress" 
                @clearClaimAmount="clearClaimAmount" 
                @updateLastClaimPeriod="updateLastClaimPeriod"
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
                @clearClaimAmount="clearClaimAmount" 
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
      claimAmountWei: 0, // how much rewards can user claim
      claimRewardsTotalWei: 0, // total rewards to be claimed for the previous period
      currentTab: "deposit",
      futureRewardsWei: 0, // total rewards to be claimed for the current period
      lastClaimPeriod: 0,
      loadingStakingData: false,
      lockedTimeLeft: 0, // in seconds
      minDepositWei: 0,
      maxDepositWei: 0,
      periodLength: 0,
      receiptTokenBalanceWei: 0,
      stakingContract: null, // staking contract instance
      stakingToken: null, // staking token contract/instance
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
      this.stakingTokenBalanceWei = Number(this.stakingTokenBalanceWei) + Number(aBalance);
      this.receiptTokenBalanceWei = Number(this.receiptTokenBalanceWei) - Number(aBalance);
    },

    changeCurrentTab(tab) {
      this.currentTab = tab;
      localStorage.setItem("stakeCurrentTab", tab);
    },

    clearClaimAmount() {
      this.claimAmountWei = 0;
    },

    async fetchClaimRewardsTotal() {
      this.claimRewardsTotalWei = await this.stakingContract.claimRewardsTotal();
    },

    async fetchFutureRewards() {
      this.futureRewardsWei = await this.stakingContract.futureRewards();
    },

    async fetchLockedTimeLeft() {
      this.lockedTimeLeft = await this.stakingContract.getLockedTimeLeft(this.address);
    },

    async fetchPreviewClaim() {
      this.claimAmountWei = await this.stakingContract.previewClaim(this.address);
    },

    async fetchStakingData() {
      this.loadingStakingData = true;

      // set up staking contract (which is also receipt token contract)
      const stakingContractInterface = new ethers.utils.Interface([
        "function balanceOf(address _owner) public view returns (uint256)",
        "function claimRewardsTotal() external view returns (uint256)",
        "function futureRewards() external view returns (uint256)",
        "function getLockedTimeLeft(address _user) external view returns (uint256)",
        "function lastClaimPeriod() external view returns (uint256)",
        "function minDeposit() external view returns (uint256)",
        "function maxDeposit() external view returns (uint256)",
        "function periodLength() external view returns (uint256)",
        "function previewClaim(address _claimer) public view returns (uint256)"
      ]);

      this.stakingContract = new ethers.Contract(
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

      this.stakingToken = new ethers.Contract(
        this.$config.stakingTokenAddress,
        stakingTokenInterface,
        this.signer
      );

      // fetch previewClaim
      this.fetchPreviewClaim();

      // fetch staking token balance
      this.stakingTokenBalanceWei = await this.stakingToken.balanceOf(this.address);

      // fetch staking token approved amount for the staking contract
      this.stakingTokenAllowanceWei = await this.stakingToken.allowance(
        this.address,
        this.$config.stakingContractAddress
      );

      // fetch receipt token balance
      this.receiptTokenBalanceWei = await this.stakingContract.balanceOf(this.address);

      // fetch getLockedTimeLeft
      this.fetchLockedTimeLeft();

      // fetch staking token decimals
      // this.stakingTokenDecimals = await this.stakingToken.decimals();

      // fetch minDeposit
      this.minDepositWei = await this.stakingContract.minDeposit();

      this.loadingStakingData = false;

      // less sensitive data that can be fetched later (no need to wait)

      // fetch lastClaimPeriod
      this.lastClaimPeriod = await this.stakingContract.lastClaimPeriod();

      // fetch periodLength
      this.periodLength = await this.stakingContract.periodLength();

      // fetch maxDeposit
      this.maxDepositWei = await this.stakingContract.maxDeposit();

      // fetch claimRewardsTotal
      this.fetchClaimRewardsTotal();

      // fetch futureRewards
      this.fetchFutureRewards();
    },

    subtractBalance(subBalance) { // staking token balance
      this.stakingTokenBalanceWei = Number(this.stakingTokenBalanceWei) - Number(subBalance);
      this.receiptTokenBalanceWei = Number(this.receiptTokenBalanceWei) + Number(subBalance);
      this.fetchLockedTimeLeft(); // update locked time left because deposit was made
    },

    updateAllowance(newAllowance) {
      this.stakingTokenAllowanceWei = Number(newAllowance);
    },

    updateLastClaimPeriod() {
      this.lastClaimPeriod = Math.floor(Date.now() / 1000);
      this.fetchPreviewClaim();
      this.fetchClaimRewardsTotal();
      this.fetchFutureRewards();
    },
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