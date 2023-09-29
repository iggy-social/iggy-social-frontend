<template>
  <Head>
    <Title>Stake and Earn | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" content="Stake and Earn" />

    <Meta name="description" :content="'Stake and earn ' + $config.tokenSymbol + ' on ' + $config.projectName + '!'" />

    <Meta property="og:image" :content="$config.projectUrl+$config.previewImageStake" />
    <Meta property="og:description" :content="'Stake and earn ' + $config.tokenSymbol + ' on ' + $config.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImageStake" />
    <Meta name="twitter:description" :content="'Stake and earn ' + $config.tokenSymbol + ' on ' + $config.projectName + '!'" />
  </Head>

  <div class="card border scroll-500">
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
          >Stake</button>
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
          >Unstake</button>
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
                :lpTokenAllowanceWei="lpTokenAllowanceWei" 
                :lpTokenDecimals="lpTokenDecimals" 
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
                :lpTokenDecimals="lpTokenDecimals" 
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
import { useUserStore } from '~/store/user';

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
      stakingContract: null, // staking contract instance
      lpToken: null, // staking token contract/instance
      lpTokenAllowanceWei: 0,
      lpTokenDecimals: 18
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
      const lpTokenInterface = new ethers.utils.Interface([
        "function allowance(address _owner, address _spender) public view returns (uint256)",
        "function balanceOf(address _owner) public view returns (uint256)",
        "function decimals() public view returns (uint8)"
      ]);

      this.lpToken = new ethers.Contract(
        this.$config.lpTokenAddress,
        lpTokenInterface,
        this.signer
      );

      // fetch previewClaim
      this.fetchPreviewClaim();

      // fetch staking token balance
      this.userStore.setLpTokenBalanceWei(await this.lpToken.balanceOf(this.address));

      // fetch staking token approved amount for the staking contract
      this.lpTokenAllowanceWei = await this.lpToken.allowance(
        this.address,
        this.$config.stakingContractAddress
      );

      // fetch receipt token balance
      this.userStore.setStakeTokenBalanceWei(await this.stakingContract.balanceOf(this.address));

      // fetch getLockedTimeLeft
      this.fetchLockedTimeLeft();

      // fetch staking token decimals
      // this.lpTokenDecimals = await this.lpToken.decimals();

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
      this.userStore.setLpTokenBalanceWei(this.userStore.getLpTokenBalanceWei.sub(subBalance));
      this.userStore.setStakeTokenBalanceWei(this.userStore.getStakeTokenBalanceWei.add(subBalance));
      this.fetchLockedTimeLeft(); // update locked time left because deposit was made
    },

    updateAllowance(newAllowance) {
      this.lpTokenAllowanceWei = Number(newAllowance);
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
    const userStore = useUserStore();

    return { address, signer, userStore };
  },

  watch: {
    address() {
      this.fetchStakingData();
    }
  }
}
</script>