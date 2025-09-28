<template>
  <Head>
    <Title>Stake and Earn | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" content="Stake and Earn" />

    <Meta name="description" :content="'Stake and earn ' + $config.public.tokenSymbol + ' on ' + $config.public.projectName + '!'" />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageStake" />
    <Meta
      property="og:description"
      :content="'Stake and earn ' + $config.public.tokenSymbol + ' on ' + $config.public.projectName + '!'"
    />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageStake" />
    <Meta
      name="twitter:description"
      :content="'Stake and earn ' + $config.public.tokenSymbol + ' on ' + $config.public.projectName + '!'"
    />
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
          >
            Stake
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" :class="currentTab === 'claim' ? 'active' : ''" @click="changeCurrentTab('claim')">
            Claim
          </button>
        </li>

        <li class="nav-item">
          <button
            class="nav-link"
            :class="currentTab === 'withdraw' ? 'active' : ''"
            @click="changeCurrentTab('withdraw')"
          >
            Unstake
          </button>
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
                @clearClaimAmount="clearClaimAmount"
                @fetchLockedTimeLeft="fetchLockedTimeLeft"
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
import { useAccount, useConfig } from '@wagmi/vue'

import StakingClaim from '@/components/stake/StakingClaim.vue'
import StakingDeposit from '@/components/stake/StakingDeposit.vue'
import StakingWithdrawal from '@/components/stake/StakingWithdrawal.vue'
import { useAccountData } from '@/composables/useAccountData'
import { readData } from '@/utils/contractUtils'

export default {
  name: 'Stake',

  data() {
    return {
      claimAmountWei: 0, // how much rewards can user claim
      claimRewardsTotalWei: 0, // total rewards to be claimed for the previous period
      currentTab: 'deposit',
      futureRewardsWei: 0, // total rewards to be claimed for the current period
      lastClaimPeriod: 0,
      loadingStakingData: false,
      lockedTimeLeft: 0, // in seconds
      minDepositWei: 0,
      maxDepositWei: 0,
      periodLength: 0,
      lpTokenAllowanceWei: 0,
    }
  },

  components: {
    StakingClaim,
    StakingDeposit,
    StakingWithdrawal,
  },

  mounted() {
    // get current tab from localStorage
    this.currentTab = localStorage.getItem('stakeCurrentTab')

    if (!this.currentTab) {
      this.currentTab = 'deposit'
    }

    if (this.address) {
      this.fetchStakingData()
    }
  },

  methods: {
    changeCurrentTab(tab) {
      this.currentTab = tab
      localStorage.setItem('stakeCurrentTab', tab)
    },

    clearClaimAmount() {
      this.claimAmountWei = 0
    },

    async fetchClaimRewardsTotal() {
      try {
        const result = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'claimRewardsTotal',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'claimRewardsTotal',
        })
        this.claimRewardsTotalWei = result || 0
      } catch (error) {
        console.error('Error fetching claim rewards total:', error)
        this.claimRewardsTotalWei = 0
      }
    },

    async fetchFutureRewards() {
      try {
        const result = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'futureRewards',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'futureRewards',
        })
        this.futureRewardsWei = result || 0
      } catch (error) {
        console.error('Error fetching future rewards:', error)
        this.futureRewardsWei = 0
      }
    },

    async fetchLockedTimeLeft() {
      try {
        const result = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [{ type: 'address', name: '_user' }],
              name: 'getLockedTimeLeft',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'getLockedTimeLeft',
          args: [this.address],
        })
        this.lockedTimeLeft = result || 0
      } catch (error) {
        console.error('Error fetching locked time left:', error)
        this.lockedTimeLeft = 0
      }
    },

    async fetchPreviewClaim() {
      try {
        const result = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [{ type: 'address', name: '_claimer' }],
              name: 'previewClaim',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'previewClaim',
          args: [this.address],
        })
        this.claimAmountWei = result || 0
      } catch (error) {
        console.error('Error fetching preview claim:', error)
        this.claimAmountWei = 0
      }
    },

    async fetchLpTokenBalance() {
      try {
        const result = await readData({
          address: this.$config.public.lpTokenAddress,
          abi: [
            {
              inputs: [{ type: 'address', name: '_owner' }],
              name: 'balanceOf',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'balanceOf',
          args: [this.address],
        })
        
        this.setLpTokenBalanceWei(result || BigInt(0))
      } catch (error) {
        console.error('Error fetching LP token balance:', error)
        this.setLpTokenBalanceWei(BigInt(0))
      }
    },

    async fetchLpTokenAllowance() {
      try {
        const allowanceResult = await readData({
          address: this.$config.public.lpTokenAddress,
          abi: [
            {
              inputs: [
                { type: 'address', name: '_owner' },
                { type: 'address', name: '_spender' },
              ],
              name: 'allowance',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'allowance',
          args: [this.address, this.$config.public.stakingContractAddress],
        })
        this.lpTokenAllowanceWei = allowanceResult || 0
      } catch (error) {
        console.error('Error fetching LP token allowance:', error)
        this.lpTokenAllowanceWei = 0
      }
    },

    async fetchStakeTokenBalance() {
      try {
        const stakeTokenBalanceResult = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [{ type: 'address', name: '_owner' }],
              name: 'balanceOf',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'balanceOf',
          args: [this.address],
        })
        
        this.setStakeTokenBalanceWei(stakeTokenBalanceResult || BigInt(0))
      } catch (error) {
        console.error('Error fetching stake token balance:', error)
        this.setStakeTokenBalanceWei(BigInt(0))
      }
    },

    async fetchMinDeposit() {
      try {
        const minDepositResult = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'minDeposit',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'minDeposit',
        })
        this.minDepositWei = minDepositResult || 0
      } catch (error) {
        console.error('Error fetching min deposit:', error)
        this.minDepositWei = 0
      }
    },

    async fetchLastClaimPeriod() {
      try {
        const lastClaimPeriodResult = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'lastClaimPeriod',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'lastClaimPeriod',
        })
        this.lastClaimPeriod = lastClaimPeriodResult || 0
      } catch (error) {
        console.error('Error fetching last claim period:', error)
        this.lastClaimPeriod = 0
      }
    },

    async fetchPeriodLength() {
      try {
        const periodLengthResult = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'periodLength',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'periodLength',
        })
        this.periodLength = periodLengthResult || 0
      } catch (error) {
        console.error('Error fetching period length:', error)
        this.periodLength = 0
      }
    },

    async fetchMaxDeposit() {
      try {
        const maxDepositResult = await readData({
          address: this.$config.public.stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: 'maxDeposit',
              outputs: [{ type: 'uint256', name: '' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'maxDeposit',
        })
        this.maxDepositWei = maxDepositResult || 0
      } catch (error) {
        console.error('Error fetching max deposit:', error)
        this.maxDepositWei = 0
      }
    },

    async fetchStakingData() {
      this.loadingStakingData = true

      try {
        // fetch previewClaim
        await this.fetchPreviewClaim()

        // fetch LP token balance
        await this.fetchLpTokenBalance()

        // fetch LP token approved amount for the staking contract
        await this.fetchLpTokenAllowance()

        // fetch receipt token balance
        await this.fetchStakeTokenBalance()

        // fetch getLockedTimeLeft
        await this.fetchLockedTimeLeft()

        // fetch minDeposit
        await this.fetchMinDeposit()

        this.loadingStakingData = false

        // less sensitive data that can be fetched later (no need to wait)

        // fetch lastClaimPeriod
        await this.fetchLastClaimPeriod()

        // fetch periodLength
        await this.fetchPeriodLength()

        // fetch maxDeposit
        await this.fetchMaxDeposit()

        // fetch claimRewardsTotal
        await this.fetchClaimRewardsTotal()

        // fetch futureRewards
        await this.fetchFutureRewards()
      } catch (error) {
        console.error('Error fetching staking data:', error)
        this.loadingStakingData = false
      }
    },

    updateAllowance(newAllowance) {
      this.lpTokenAllowanceWei = Number(newAllowance)
    },

    updateLastClaimPeriod() {
      this.lastClaimPeriod = Math.floor(Date.now() / 1000)
      this.fetchPreviewClaim()
      this.fetchClaimRewardsTotal()
      this.fetchFutureRewards()
    },

    updateStakeTokenBalance(amountChange) {
      const currentBalance = this.getStakeTokenBalanceWei()
      this.setStakeTokenBalanceWei(currentBalance + amountChange)
    },
  },

  watch: {
    address() {
      if (this.address) {
        this.fetchStakingData()
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })

    const { 
      getLpTokenBalanceWei, 
      setLpTokenBalanceWei,
      getStakeTokenBalanceWei,
      setStakeTokenBalanceWei
    } = useAccountData()

    return { 
      address, 
      getLpTokenBalanceWei, 
      setLpTokenBalanceWei,
      getStakeTokenBalanceWei,
      setStakeTokenBalanceWei
    }
  },
}
</script>
