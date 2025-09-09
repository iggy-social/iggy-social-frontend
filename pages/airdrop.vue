<template>
  <Head>
    <Title>Airdrop | {{ $config.public.projectMetadataTitle }}</Title>
    <Meta property="og:title" content="Airdrop" />

    <Meta
      name="description"
      :content="'Claim your ' + $config.public.chatTokenSymbol + ' token airdrop on ' + $config.public.projectName + '!'"
    />

    <Meta property="og:image" :content="$config.public.projectUrl + $config.public.previewImageAirdrop" />
    <Meta
      property="og:description"
      :content="'Claim your ' + $config.public.chatTokenSymbol + ' token airdrop on ' + $config.public.projectName + '!'"
    />

    <Meta name="twitter:image" :content="$config.public.projectUrl + $config.public.previewImageAirdrop" />
    <Meta
      name="twitter:description"
      :content="'Claim your ' + $config.public.chatTokenSymbol + ' token airdrop on ' + $config.public.projectName + '!'"
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
          <button class="nav-link" :class="currentTab === 'domain' ? 'active' : ''" @click="changeCurrentTab('domain')">
            Domain holders
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" :class="currentTab === 'ap' ? 'active' : ''" @click="changeCurrentTab('ap')">
            Activity Points
          </button>
        </li>
      </ul>
      <!-- END Tabs Navigation -->

      <!-- Tabs Content -->
      <div class="tab-content mt-3">
        <!-- First Tab -->
        <div v-if="currentTab === 'domain'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <AirdropDomainHolders />
            </div>
          </div>
        </div>

        <!-- Second Tab -->
        <div v-if="currentTab === 'ap'">
          <div class="d-flex justify-content-center mt-5">
            <div class="col-12 col-lg-8">
              <AirdropActivityPoints />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AirdropDomainHolders from '@/components/airdrop/AirdropDomainHolders.vue'
import AirdropActivityPoints from '@/components/airdrop/AirdropActivityPoints.vue'

export default {
  name: 'Airdrop',

  data() {
    return {
      currentTab: 'domain',
    }
  },

  components: {
    AirdropDomainHolders,
    AirdropActivityPoints,
  },

  mounted() {
    // get current tab from localStorage
    this.currentTab = localStorage.getItem('airdropCurrentTab')

    if (!this.currentTab) {
      this.currentTab = 'domain'
    }
  },

  methods: {
    changeCurrentTab(tab) {
      this.currentTab = tab
      localStorage.setItem('airdropCurrentTab', tab)
    },
  },
}
</script>
