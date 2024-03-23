<template>
  <div>
    <Head>
      <Title>{{ $config.projectMetadataTitle }}</Title>
      <Meta name="description" :content="$config.projectDescription" />
      <Link rel="icon" type="image/x-icon" :href="$config.favicon" />

      <Meta property="og:title" :content="$config.projectMetadataTitle" />
      <Meta property="og:description" :content="$config.projectDescription" />
      <Meta property="og:image" :content="$config.projectUrl+$config.previewImage" />

      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" :content="$config.projectTwitter" />
      <Meta name="twitter:creator" :content="$config.projectTwitter" />
      <Meta name="twitter:title" :content="$config.projectMetadataTitle" />
      <Meta name="twitter:description" :content="$config.projectDescription" />
      <Meta name="twitter:image" :content="$config.projectUrl+$config.previewImage" />
    </Head>

    <NavbarDesktop v-if="!isMobile" />
    <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

    <!-- Main content with sidebars -->
    <div class="container-fluid page-container">
      <div class="row flex-nowrap">

        <SidebarLeft :lSidebar="lSidebar" :isMobile="isMobile" />

        <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="sidebarStore.showMainContent">
          <slot></slot>
        </main>

        <SidebarRight :rSidebar="rSidebar" :isMobile="isMobile" />
        
      </div>
    </div>

    <!-- Connect Wallet modal -->
    <div class="modal modal-sm fade" id="connectModal" tabindex="-1" aria-labelledby="connectModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Connect your wallet</h5>
            <button id="closeConnectModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"></span>
            </button>
          </div>
          <div class="modal-body row">

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/metamask.png" class="card-img-top card-img-wallet" alt="MetaMask">
              <small class="text-center mb-3 text-muted">MetaMask</small>
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/rabby.png" class="card-img-top card-img-wallet" alt="Rabby">
              <small class="text-center mb-3 text-muted">Rabby</small>
            </div> 

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/bifrost.png" class="card-img-top card-img-wallet" alt="Bifrost">
              <small class="text-center mb-3 text-muted">Bifrost</small>
            </div> 

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/zerion.png" class="card-img-top card-img-wallet" alt="Zerion">
              <small class="text-center mb-3 text-muted">Zerion</small>
            </div> 

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectCoinbase">
              <img src="@/assets/img/wallets/coinbase.png" class="card-img-top card-img-wallet" alt="Coinbase">
              <small class="text-center mb-3 text-muted">Coinbase</small>
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/brave.png" class="card-img-top card-img-wallet" alt="Brave">
              <small class="text-center mb-3 text-muted">Brave</small>
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/trust.png" class="card-img-top card-img-wallet" alt="Trust Wallet">
              <small class="text-center mb-3 text-muted">Trust Wallet</small>
            </div>

            <div class="card col-6 cursor-pointer wallet-img-wrapper" @click="connectMetaMask">
              <img src="@/assets/img/wallets/imtoken.png" class="card-img-top card-img-wallet" alt="imToken">
              <small class="text-center mb-3 text-muted">imToken</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END Connect Wallet modal -->

    <ChatSettingsModal />

    <ChangeUsernameModal />

    <ChangeUserPostMintPriceModal />

    <FindUserModal />

    <ReferralModal />

    <VerifyAccountOwnership />

  </div>

  <!-- Do not delete: ugly hack to make "global" work with Vite -->
  <component :is="'script'">
  var global = global || window;
  </component>
</template>

<script>
import { ethers } from 'ethers';
import { MetaMaskConnector, CoinbaseWalletConnector, useEthers, useWallet } from 'vue-dapp';
import { useNotificationsStore } from '~/store/notifications';
import { useSidebarStore } from '~/store/sidebars';
import { useSiteStore } from '~/store/site';
import { useUserStore } from '~/store/user';
import NavbarDesktop from "~/components/navbars/NavbarDesktop.vue";
import NavbarMobile from "~/components/navbars/NavbarMobile.vue";
import SidebarLeft from "~/components/sidebars/SidebarLeft.vue";
import SidebarRight from "~/components/sidebars/SidebarRight.vue";
import ChatSettingsModal from "~/components/ChatSettingsModal.vue";
import { getActivityPoints } from '~/utils/balanceUtils';
import { getDomainHolder, getDomainName } from '~/utils/domainUtils';
import { storeReferrer, storeUsername } from '~/utils/storageUtils';
import VerifyAccountOwnership from '~/components/VerifyAccountOwnership.vue';
import ReferralModal from '~/components/referrals/ReferralModal.vue';
import ChangeUsernameModal from '~/components/names/ChangeUsernameModal.vue';
import ChangeUserPostMintPriceModal from '~~/components/minted-posts/ChangeUserPostMintPriceModal.vue';
import FindUserModal from '~/components/search/FindUserModal.vue';

export default {
  data() {
    return {
      breakpoint: 1000,
      isMounted: false,
      lSidebar: null,
      referrer: null,
      rSidebar: null,
      width: null
    }
  },

  components: {
    ChangeUsernameModal,
    ChangeUserPostMintPriceModal,
    ChatSettingsModal,
    FindUserModal,
    NavbarDesktop,
    NavbarMobile,
    ReferralModal,
    SidebarLeft,
    SidebarRight,
    VerifyAccountOwnership
  },

  mounted() {
    this.isMounted = true;

    // set color mode
    document.documentElement.setAttribute("data-bs-theme", this.siteStore.getColorMode);

    // set sidebar collapse
    this.lSidebar = new bootstrap.Collapse('#sidebar1', {toggle: false});
    this.rSidebar = new bootstrap.Collapse('#sidebar2', {toggle: false});
    this.width = window.innerWidth;

    if (this.width < this.breakpoint) {
      this.sidebarStore.setLeftSidebar(false);
      this.sidebarStore.setRightSidebar(false);
      this.lSidebar.hide();
      this.rSidebar.hide();
    } else {
      this.lSidebar.show();
      //this.rSidebar.show();
      this.sidebarStore.setLeftSidebar(true);
      this.sidebarStore.setRightSidebar(true);
    }

    window.addEventListener('resize', this.onWidthChange);

    // connect to wallet if user was connected before
    if (!this.isActivated) {
			if (localStorage.getItem("connected") == "metamask") {
				this.connectMetaMask();
			} else if (localStorage.getItem("connected") == "coinbase") {
				this.connectCoinbase();
			}
		}

    // enable popovers everywhere
    new bootstrap.Popover(document.body, {
      selector: "[data-bs-toggle='popover']",
    })

    // check if file upload is enabled
    this.siteStore.setFileUploadEnabled(this.$config.fileUploadEnabled);

    // check if referrer in the URL
    this.referrer = this.$route.query.ref;
    if (this.referrer) {
      this.parseReferrer();
    }
  },

  unmounted() {
    window.removeEventListener('resize', onWidthChange);
  },

  computed: {
    isConnectedToOrbis () {
      return this.userStore.getIsConnectedToOrbis;
    },

    isMobile() {
      if (this.width < this.breakpoint) {
        return true;
      }
      return false;
    },

    orbisAddress() {
      // address which is signed with Orbis
      if (this.userStore.getDidParent) {
        // did parent example: did:pkh:eip155:137:0xb29050965a5ac70ab487aa47546cdcbc97dae45d
        // get the last item (address) from did parent
        return this.userStore.getDidParent.split(":").pop();
      }
    }
  },

  methods: {
    getActivityPoints,
    getDomainHolder,
    getDomainName, // imported function from utils/domainUtils.js

    async connectCoinbase() {
			await this.connectWith(this.coinbaseConnector);
			localStorage.setItem("connected", "coinbase"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		},

		async connectMetaMask() {
			await this.connectWith(this.mmConnector);
			localStorage.setItem("connected", "metamask"); // store in local storage to autoconnect next time
			document.getElementById('closeConnectModal').click();
		},

    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress) {
        const activityPoints = await this.getActivityPoints(this.address, this.signer);

        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    },

    async fetchChatTokenBalance() {
      if (this.$config.chatTokenAddress) {
        const chatTokenInterface = new ethers.utils.Interface([
          "function balanceOf(address owner) view returns (uint256)",
        ]);

        const chatTokenContract = new ethers.Contract(this.$config.chatTokenAddress, chatTokenInterface, this.signer);

        const balance = await chatTokenContract.balanceOf(this.address);

        this.userStore.setChatTokenBalanceWei(balance);
      }
    },

    async fetchOrbisNotifications() {
      if (this.userStore.getIsConnectedToOrbis) {
        this.notificationsStore.setLoadingNotifications(true);

        // fetch new notifications count
        let { data, error, status } = await this.$orbis.getNotificationsCount({type: "social", context: this.$config.chatChannels.general}); 

        if (status === 200 && data?.count_new_notifications) {
          this.notificationsStore.setUnreadNotificationsCount(data.count_new_notifications);
        } else if (error) {
          console.log("New notifications count error", error);
        }

        // fetch notifications
        let { 
          data: notifications, 
          error: notificationsError, 
          status: notificationsStatus 
        } = await this.$orbis.getNotifications(
          {
            type: "social", 
            context: this.$config.chatChannels.general
          }
        );

        if (notificationsStatus === 200 && notifications) {
          const newNotifications = notifications.filter(function(item) { return (item.status === "new"); });

          this.notificationsStore.setNotifications(newNotifications);
        } else if (notificationsError) {
          console.log("Notifications fetching error", notificationsError);
        }

        this.notificationsStore.setLoadingNotifications(false);
      }
    },

    async fetchOrbisProfile() {
      if (this.isActivated) {
        let { data, error } = await this.$orbis.getDids(this.address);

        if (data[0].did) {
          const profile = await this.$orbis.getProfile(data[0].did);

          if (profile && profile.data.details.profile) {
            this.userStore.setOrbisImage(profile.data.details.profile.pfp);
          }

          if (profile) {
            this.userStore.setFollowers(profile.data.count_followers);
            this.userStore.setFollowing(profile.data.count_following);
            this.userStore.setLastActivityTimestamp(profile.data.last_activity_timestamp);
          }

          // fetch notifications
          this.fetchOrbisNotifications();
        }
      }
    },

    async fetchUserDomain() {
      if (
        this.chainId === this.$config.supportedChainId &&
        this.address != this.userStore.getCurrentUserAddress
      ) {
        this.userStore.setCurrentUserAddress(this.address);
        
        let userDomain;

        if (this.signer) {
          userDomain = await this.getDomainName(this.address, this.signer);
        } else {
          userDomain = await this.getDomainName(this.address);
        }

        

        if (userDomain) {
          this.userStore.setDefaultDomain(userDomain+this.$config.tldName);
          storeUsername(window, this.address, userDomain+this.$config.tldName);
        } else {
          this.userStore.setDefaultDomain(null);
        }

        this.fetchActivityPoints();
        this.fetchChatTokenBalance();
      }
    },

    async getOrbisDids() {
      const isConn = await this.$orbis.isConnected();
      this.userStore.setIsConnectedToOrbis(isConn);

      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },
    
    onWidthChange() {
      this.width = window.innerWidth;
    },

    async orbisLogout() {
      await this.$orbis.logout();
      this.userStore.setIsConnectedToOrbis(false);
      this.userStore.setDid(null);
      this.userStore.setDidParent(null);
      this.userStore.setOrbisImage(null);
    },

    async parseReferrer() {
      // check if referrer is a domain name
      if (!this.referrer.startsWith("0x")) {
        let domainName = this.referrer;

        if (this.referrer.includes(this.$config.tldName)) {
          // get the domain name without extension
          domainName = this.referrer.split(".")[0];
        }

        // fetch the domain holder address
        this.referrer = await this.getDomainHolder(domainName);
      }

      if (this.address) {
        if (String(this.address).toLowerCase() === String(this.referrer).toLowerCase()) {
          return; // cannot refer yourself
        }
      }

      // check if referrer is a valid address and not a zero address
      if (ethers.utils.isAddress(this.referrer) && this.referrer != ethers.constants.AddressZero) {
        // store into local storage as referrer
        storeReferrer(window, this.referrer);
      }
    }
  },

  setup() {
    const config = useRuntimeConfig();
    const notificationsStore = useNotificationsStore();
    const sidebarStore = useSidebarStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const { address, chainId, isActivated, signer } = useEthers();
    const { connectWith } = useWallet();

    const coinbaseConnector = new CoinbaseWalletConnector({
			appName: config.projectName,
			jsonRpcUrl: config.rpcCustom,
		});

		const mmConnector = new MetaMaskConnector({
			appUrl: config.projectUrl,
		});
    
    return { 
      address, chainId, coinbaseConnector, connectWith, isActivated, mmConnector, signer, 
      notificationsStore, sidebarStore, siteStore, userStore 
    }
  },

  watch: {
    address(newVal, oldVal) {
      // if address changes, clear local & session storage (needs further testing)
      if (
        newVal.startsWith("0x") &&
        oldVal.startsWith("0x") &&
        String(newVal).toLowerCase() !== String(oldVal).toLowerCase()
      ) {
        this.orbisLogout();
      }

      if (newVal) {
        this.fetchUserDomain();
      }
    },

    chainId(newVal, oldVal) {
      if (newVal) {
        this.fetchUserDomain();
      }
    },

    isActivated(newVal, oldVal) {
			if (oldVal === true && newVal === false) { // if user disconnects, clear the local storage
        console.log("user disconnected");
        localStorage.setItem("connected", "");
        this.orbisLogout();
			} else {
        if (!this.userStore.getDid) {
          this.getOrbisDids();
        }
      }
		},

    isConnectedToOrbis(newVal, oldVal) {
      if (newVal && oldVal === false) {
        this.fetchOrbisProfile();
      }
    },

    orbisAddress(newVal, oldVal) {
      if (newVal && this.address) {
        if (String(newVal).toLowerCase() != String(this.address).toLowerCase()) {
          console.log("Logging out of Orbis because the address in signed Orbis credentials does not matched the current user's address.");
          this.orbisLogout();
        }
      }
    },

    width(newVal, oldVal) {
      if (newVal > this.breakpoint) {
        this.lSidebar.show();
        this.rSidebar.show();
        this.sidebarStore.setLeftSidebar(true);
        this.sidebarStore.setMainContent(true);
        this.sidebarStore.setRightSidebar(true);
      } else {
        this.lSidebar.hide();
        this.rSidebar.hide();
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
        this.sidebarStore.setRightSidebar(false);
      }
    },
  }
}
</script>