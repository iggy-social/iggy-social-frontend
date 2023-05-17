<template>
  <Head>
    <Title>Airdrop</Title>
    <Meta property="og:title" content="Airdrop" />
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
            :class="currentTab === 'domain' ? 'active' : ''" 
            @click="changeCurrentTab('domain')" 
          >Domain holders</button>
        </li>

        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="currentTab === 'post' ? 'active' : ''" 
            @click="changeCurrentTab('post')" 
          >Post Minters</button>
        </li>

      </ul>
      <!-- END Tabs Navigation -->

      <!-- Tabs Content -->
      <div class="tab-content mt-3">

        <!-- First Tab -->
        <div v-if="currentTab === 'domain'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <AirdropDomainHolders
                :domainChatRewardWei="domainChatRewardWei"
                :loadingData="fetchingData"
              />
            </div>
          </div>
        </div>

        <!-- Second Tab -->
        <div v-if="currentTab === 'post'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              Airdrop for post minters
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
import AirdropDomainHolders from '~/components/airdrop/AirdropDomainHolders.vue';

export default {
  name: 'Airdrop',

  data() {
    return {
      currentTab: "domain",
      domainChatRewardWei: 100000000000000,
      fetchingData: false,
    }
  },

  components: {
    AirdropDomainHolders
  },

  mounted() {
    // get current tab from localStorage
    this.currentTab = localStorage.getItem("airdropCurrentTab");

    if (!this.currentTab) {
      this.currentTab = "domain";
    }

    if (this.address) {
      this.fetchAirdropData();
    }
  },

  methods: {
    changeCurrentTab(tab) {
      this.currentTab = tab;
      localStorage.setItem("airdropCurrentTab", tab);
    },

    async fetchAirdropData() {
      // TODO: fetch airdrop data
      this.fetchingData = true;

      // get data from post enum contract

      // fetch chat reward from the ChatTokenClaimDomains contract
      const chatTokenClaimDomainsInterface = new ethers.utils.Interface([
        "function chatReward() external view returns (uint256)"
      ]);

      const chatTokenClaimDomainsContract = new ethers.Contract(
        this.$config.chatTokenClaimDomainsAddress,
        chatTokenClaimDomainsInterface,
        this.signer
      );

      this.domainChatRewardWei = await chatTokenClaimDomainsContract.chatReward();

      this.fetchingData = false;
    }
  },

  setup() {
    const { address, signer } = useEthers();

    return { address, signer }
  },

  watch: {
    address() {
      this.fetchAirdropData();
    }
  }
}
</script>