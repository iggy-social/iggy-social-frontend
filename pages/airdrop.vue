<template>
  <Head>
    <Title>Airdrop | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" content="Airdrop" />

    <Meta name="description" :content="'Claim your ' + $config.chatTokenSymbol + ' token airdrop on ' + $config.projectName + '!'" />

    <Meta property="og:image" :content="$config.projectUrl+$config.previewImageAirdrop" />
    <Meta property="og:description" :content="'Claim your ' + $config.chatTokenSymbol + ' token airdrop on ' + $config.projectName + '!'" />

    <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImageAirdrop" />
    <Meta name="twitter:description" :content="'Claim your ' + $config.chatTokenSymbol + ' token airdrop on ' + $config.projectName + '!'" />
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
            :class="currentTab === 'domain' ? 'active' : ''" 
            @click="changeCurrentTab('domain')" 
          >Domain holders</button>
        </li>

        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="currentTab === 'ap' ? 'active' : ''" 
            @click="changeCurrentTab('ap')" 
          >Activity Points</button>
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
        <div v-if="currentTab === 'ap'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <AirdropActivityPoints
                :airdropApWei="airdropApWei"
                :loadingData="fetchingData" 
                @setDomainChatRewardWeiToZero="setDomainChatRewardWeiToZero"
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
import AirdropDomainHolders from '~/components/airdrop/AirdropDomainHolders.vue';
import AirdropActivityPoints from '~/components/airdrop/AirdropActivityPoints.vue';

export default {
  name: 'Airdrop',

  data() {
    return {
      airdropApWei: 0, // the amount of CHAT tokens that user will get for past APs
      currentTab: "domain",
      domainChatRewardWei: 100000000000000,
      fetchingData: false,
    }
  },

  components: {
    AirdropDomainHolders,
    AirdropActivityPoints
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
      // fetch airdrop data
      this.fetchingData = true;

      // fetch chat reward from the ChatTokenClaimDomains contract
      const chatTokenClaimDomainsInterface = new ethers.utils.Interface([
        "function chatReward() external view returns (uint256)"
      ]);

      const chatTokenClaimDomainsContract = new ethers.Contract(
        this.$config.airdropClaimDomainsAddress,
        chatTokenClaimDomainsInterface,
        this.signer
      );

      this.domainChatRewardWei = await chatTokenClaimDomainsContract.chatReward();

      // preview airdrop claim for past APs
      const claimApInterface = new ethers.utils.Interface([
        "function claimPreview(address _address) public view returns (uint256)"
      ]);

      const claimApContract = new ethers.Contract(
        this.$config.airdropApAddress,
        claimApInterface,
        this.signer
      );

      this.airdropApWei = await claimApContract.claimPreview(this.address);

      this.fetchingData = false;
    },

    setDomainChatRewardWeiToZero() {
      this.domainChatRewardWei = 0;
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