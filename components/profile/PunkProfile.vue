<template>
  <div>
    <div class="card border">
      <div class="card-body">
        <p class="fs-3">
          <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
        </p>

        <div class="row">
          <div class="col-md-3 mt-3">
            <ProfileImage
              :key="domain"
              class="img-fluid img-thumbnail rounded-circle force-circle col-6 col-md-12"
              :domain="domain"
              :image="newImageLink"
            />
          </div>

          <div class="col-md-9 mt-3">
            <h3 v-if="domain && !isCurrentUser" class="mb-3">
              {{ getTextWithoutBlankCharacters(domain) }}
            </h3>
            <h3 v-if="domain && isCurrentUser" class="mb-3">
              {{ getTextWithoutBlankCharacters(domainName) }}
            </h3>
            <h3 v-if="!domain && address" class="mb-3">
              {{ shortAddress }}
            </h3>

            <!-- Data -->
            <div class="mt-4 muted-text" style="font-size: 14px">
              <p class="me-4">
                <i class="bi bi-wallet me-1"></i>
                {{ balanceEth }} {{ $config.public.tokenSymbol }}
              </p>

              <p class="me-4" v-if="$config.public.chatTokenAddress">
                <i class="bi bi-wallet me-1"></i>
                {{ balanceChatToken }} {{ $config.public.chatTokenSymbol }}
              </p>

              <p class="me-4" v-if="$config.public.activityPointsAddress && $config.public.showFeatures.activityPoints">
                <i class="bi bi-wallet me-1"></i>
                {{ getLessDecimals(balanceAp) }} AP
              </p>

              <p class="me-4">
                <i class="bi bi-box-arrow-up-right me-2"></i>
                <a
                  :href="$config.public.blockExplorerBaseUrl + '/address/' + uAddress"
                  target="_blank"
                  class="body-color hover-color"
                  style="text-decoration: none"
                >
                  {{ shortenAddress(uAddress) }}
                </a>
              </p>
            </div>
            <!-- END Data -->

            <!-- Buttons -->
            <div class="mt-2" v-if="isCurrentUser">

              <!-- Actions dropdown button -->
              <div class="dropdown mt-2">
                <button
                  class="btn btn-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-sliders"></i>
                  Profile settings
                </button>
                <div class="dropdown-menu">

                  <span
                    class="dropdown-item cursor-pointer"
                    data-bs-toggle="modal"
                    :data-bs-target="'#changeImageModal' + $.uid"
                  >
                    <i class="bi bi-person-circle"></i> Change your profile picture
                  </span>

                  <span
                    class="dropdown-item cursor-pointer"
                    data-bs-toggle="modal"
                    data-bs-target="#changeUsernameModal"
                  >
                    <i class="bi bi-pencil-square"></i> Change your username
                  </span>

                  <!--
                  <span
                    class="dropdown-item cursor-pointer"
                    data-bs-toggle="modal"
                    data-bs-target="#changeDefaultPostPriceModal"
                  >
                    <i class="bi bi-tags-fill"></i> Change your post minting price
                  </span>

                  <span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#chatSettingsModal">
                    <i class="bi bi-gear-fill"></i> Other settings
                  </span>
                  -->

                  <!--
									<span
										class="dropdown-item cursor-pointer"
										data-bs-toggle="modal"
										data-bs-target="#referralModal"
									>
										<i class="bi bi-person-plus-fill"></i> Share referral link
									</span>
									-->
                </div>
              </div>
            </div>
            <!-- END Buttons -->

            <!-- Send tokens to user -->
            <NuxtLink
              v-if="domain && !isCurrentUser && $config.public.showFeatures.sendTokens"
              class="btn btn-primary mt-2"
              :to="'/send-tokens/?to=' + domain"
            >
              <i class="bi bi-send"></i>
              Send a tip
            </NuxtLink>
            <!-- END Send tokens to user -->
          </div>
        </div>

      </div>

      <!-- Change Image Modal -->
      <ChangePfpModal
        v-if="isCurrentUser"
        :key="domain"
        :domainName="domain"
        :componentId="$.uid"
        storageType="arweave" 
        @processFileUrl="insertImage"
      />
      <!-- END Change Image Modal -->
    </div>

  </div>
</template>

<script>
import { formatEther, formatUnits } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import ChangePfpModal from '@/components/profile/ChangePfpModal.vue'
import ProfileImage from '@/components/profile/ProfileImage.vue'

import { useAccountData } from '@/composables/useAccountData'

import { shortenAddress } from '@/utils/addressUtils'
import { getActivityPoints, getNativeCoinBalanceWei } from '@/utils/balanceUtils'
import { fetchUsername, storeData, storeUsername } from '@/utils/browserStorageUtils'
import { readData } from '@/utils/contractUtils'
import { getDomainName, getDomainHolder } from '@/utils/domainUtils'
import { getLessDecimals } from '@/utils/numberUtils'
import { getTextWithoutBlankCharacters } from '@/utils/textUtils'

export default {
  name: 'PunkProfile',
  props: ['pAddress', 'pDomain'],

  data() {
    return {
      balanceAp: 0,
      balanceChatTokenWei: BigInt(0),
      domain: this.pDomain,
      newEmail: null,
      newImageLink: null,
      uAddress: this.pAddress,
      uBalance: BigInt(0),
      waitingDataLoad: false,
      waitingImageUpdate: false,
    }
  },

  components: {
    ChangePfpModal,
    ProfileImage,
  },

  mounted() {
    // if uAddress and/or domain is not provided via props, then find it yourself
    if (!this.pAddress || !this.pDomain) {
      this.fetchAddressAndDomain()
    }
  },

  computed: {
    balanceChatToken() {
      return getLessDecimals(formatUnits(this.balanceChatTokenWei, 18))
    },

    balanceEth() {
      return getLessDecimals(formatEther(this.uBalance))
    },

    isCurrentUser() {
      return String(this.uAddress).toLowerCase() === String(this.address).toLowerCase()
    },

    domainWithoutExtension() {
      if (!this.domain) {
        return null
      }

      return String(this.domain).replace(this.$config.public.tldName, "")
    },

    shortAddress() {
      return this.address ? shortenAddress(this.address) : ''
    }
  },

  methods: {
    changeCurrentTab(tab) {
      this.currentTab = tab
      localStorage.setItem('profileCurrentTab', tab)
    },

    async fetchAddressAndDomain() {
      this.waitingDataLoad = true

      // see if id is in the URL query and figure out whether it is a domain or uAddress
      if (this.$route.query.id) {
        const id = this.$route.query.id

        if (id.includes('.')) {
          this.domain = id // domain
        } else {
          this.uAddress = id // address
        }
      } else {
        // if no id is provided, then use the user's address
        this.uAddress = this.address
      }

      // if domain is not provided, check storage
      if (!this.domain && this.uAddress) {
        this.domain = fetchUsername(window, this.uAddress)
      }

      // if domain is not provided, then fetch it
      if (!this.domain && this.uAddress) {
        const domainName = await getDomainName(this.uAddress, window)

        if (domainName) {
          const fullDomainName = domainName.split('.')[0] + this.$config.public.tldName
          this.domain = fullDomainName

          storeUsername(window, this.uAddress, this.domain)
        }
      }

      if (this.domain && !this.uAddress) {
        const domainHolder = await getDomainHolder(String(this.domain).toLowerCase().split('.')[0])

        if (domainHolder && domainHolder !== '0x0000000000000000000000000000000000000000') {
          this.uAddress = domainHolder
        }

        this.domain = String(this.domain).split('.')[0] + this.$config.public.tldName
        
        storeUsername(window, this.uAddress, this.domain)
      }

      await this.fetchBalance()
    },

    async fetchBalance() {
      if (this.uAddress) {
        // fetch balance of an address
        this.uBalance = await getNativeCoinBalanceWei(this.uAddress)

        if (this.$config.public.chatTokenAddress) {
          // fetch chat balance
          const chatTokenContractConfig = {
            address: this.$config.public.chatTokenAddress,
            abi: [
              {
                constant: true,
                inputs: [{ name: 'owner', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                payable: false,
                stateMutability: 'view',
                type: 'function'
              }
            ],
            functionName: 'balanceOf',
            args: [this.uAddress]
          }

          const result = await readData(chatTokenContractConfig)
          if (result) {
            this.balanceChatTokenWei = result
          }
        }

        // fetch activity points balance
        if (this.$config.public.activityPointsAddress && this.$config.public.showFeatures.activityPoints) {
          this.balanceAp = await getActivityPoints(this.uAddress)
        }
      }
    },

    async insertImage(imageUrl) {
      this.newImageLink = imageUrl

      if (imageUrl) {
        storeData(window, this.domainWithoutExtension, { image: imageUrl }, "img")
      }
    },
  },

  setup() {
    const config = useConfig()
    const { address } = useAccount({ config })
    const { domainName } = useAccountData()
    const toast = useToast()

    return { 
      address, 
      domainName, 
      toast
    }
  },

  watch: {
    address() {
      this.fetchAddressAndDomain()
    },
  },
}
</script>
