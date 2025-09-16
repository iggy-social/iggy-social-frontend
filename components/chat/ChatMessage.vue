<template>
  <div class="card mb-3 border" v-if="message">
    <div class="card-body row">

      <!-- Author profile image -->
      <div class="col-2 col-md-1 pfp-sizing" title="Profile image and link to the profile">
        <NuxtLink :to="'/profile/?id=' + String(showDomainOrFullAddress)">
          <ProfileImage
            class="img-fluid rounded-circle pfp-img force-circle"
            :domain="authorDomain"
          />
        </NuxtLink>
      </div>

      <div class="col-10 col-md-11 post-sizing">

        <!-- post author and timestamp -->
        <p class="card-subtitle mb-2 text-muted">
          <NuxtLink 
            class="link-without-color hover-color" 
            :to="'/profile/?id=' + String(showDomainOrFullAddress)"
            title="Go to profile page"
          >
            {{ showDomainOrAddress }}
          </NuxtLink>
          <span v-if="message?.createdAt && !isComment">
            ·
            <NuxtLink 
              class="link-without-color hover-color" 
              :to="postUrl"
              title="Time since post was created and link to the post page"
            >
              {{ timeSince }}
            </NuxtLink>
          </span>
          <span v-if="message?.createdAt && isComment" title="Time since post was created">
            ·
            {{ timeSince }}
          </span>
          <span v-if="message?.url">
            ·
            <a class="link-without-color hover-color" :href="getArweaveUrl" target="_blank" title="Link to post stored on Arweave">
              <span style="font-size: 0.9em;">ⓐ</span>
            </a>
          </span>
        </p>

        <!-- post text -->
        <div v-if="parsedText">
          <p class="card-text text-break post-text-color" v-if="parsedText.length > messageLengthLimit && !showFullText">
            <span v-html="parsedText.substring(0, messageLengthLimit) + ' ... '"> </span>
            <span class="cursor-pointer hover-color" @click="showFullText = true">Read more</span>
          </p>

          <p
            v-if="parsedText.length < messageLengthLimit || showFullText"
            class="card-text text-break post-text-color"
            v-html="parsedText"
          ></p>
        </div>

        <!-- link preview -->
        <div v-if="linkPreview?.title" class="row mt-3 mb-3">
          <div class="card col-md-6 preview-card">
            <a target="_blank" :href="linkPreview.url" class="text-decoration-none text-reset">
              <Image v-if="linkPreviewImage" :url="linkPreviewImage" :alt="linkPreview.title" cls="card-img-top preview-card-img" />

              <div class="card-body bg-body rounded-bottom-3 border-end border-bottom border-start preview-card-body">
                <h5 class="card-title text-break">{{ linkPreview.title }}</h5>
                <p class="card-text text-break post-text-color text-reset">{{ linkPreview.description }}</p>
              </div>
            </a>
          </div>
        </div>
        <!-- END link preview -->

        <!-- post actions -->
        <p class="card-subtitle mt-3 text-muted">

          <!-- Replies count -->
          <NuxtLink v-if="isMainChatMessage" class="link-without-color hover-color" :to="postUrl" title="See replies to this post">
            <i class="bi bi-chat"></i>
            {{ message.repliesCount }} replies
          </NuxtLink>

          <!-- Delete message -->
          <span
            v-if="isCurrentUserAuthor || currUserIsMod"
            class="cursor-pointer hover-color"
            :class="{ 'ms-3': isMainChatMessage }"
            data-bs-toggle="modal"
            :data-bs-target="'#deleteModal' + storageId"
            title="Delete the post"
          >
            <i class="bi bi-trash" /> Delete
          </span>

        </p>

      </div>
    </div>

    <!-- Delete Modal -->
    <div
      class="modal fade"
      :id="'deleteModal' + storageId"
      :aria-labelledby="'deleteModalLabel' + storageId"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" :id="'deleteModalLabel' + storageId">Delete post</h1>
            <button
              type="button"
              class="btn-close"
              :id="'closeDeleteModal' + storageId"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="handleCloseClick"
            ></button>
          </div>
          <div class="modal-body">Do you really want to delete this post?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="deleteMessage" :disabled="waitingDeleteMessage">
              <span
                v-if="waitingDeleteMessage"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- END Delete Modal -->
  </div>
</template>

<script>
import axios from 'axios'
import { isAddress } from 'viem'
import DOMPurify from 'dompurify'
import { useToast } from 'vue-toastification/dist/index.mjs'
import Image from '@/components/Image.vue'
import WaitingToast from '@/components/WaitingToast'
import ProfileImage from '@/components/profile/ProfileImage.vue'
import { getDomainName } from '@/utils/domainUtils'
import {
  getTextWithoutBlankCharacters,
  findFirstUrl,
  imgParsing,
  imgWithoutExtensionParsing,
  urlParsing,
  youtubeParsing,
} from '@/utils/textUtils'
import { fetchData, fetchUsername, storeData, storeUsername } from '@/utils/browserStorageUtils'

export default {
  name: 'ChatMessage',
  emits: ['removePost'],
  props: [
    'mainItemId', // (optional) this is either a main message index or an address of an NFT collection or similar
    'message', // message object
    'chatContext', // address of the chat context contract
    'currentUserIsMod' // boolean
  ],

  components: {
    Image,
    ProfileImage,
  },

  data() {
    return {
      authorAddress: null,
      authorDomain: null,
      currUserIsMod: false,
      firstLink: null,
      linkPreview: null,
      messageFromStorage: null,
      messageIndex: null,
      messageLengthLimit: 550,
      parsedText: null,
      postUrl: null,
      replyIndex: null,
      showFullText: false,
      storageId: null,
      waitingDeleteMessage: false,
    }
  },

  mounted() {
    if (this.isReply) {
      this.replyIndex = this.message.index
      this.messageIndex = this.mainItemId
      this.postUrl = `/post/?id=${this.messageIndex}&reply=${this.replyIndex}&context=${this.chatContext}`
    } else if (this.isComment) {
      this.replyIndex = this.message.index
      this.messageIndex = this.mainItemId
      this.postUrl = null
    } else {
      this.messageIndex = this.message.index
      this.postUrl = `/post/?id=${this.messageIndex}&context=${this.chatContext}`
    }

    this.storageId = this.message.url.split('://')[1]

    this.fetchMessageFromStorage()

    if (this.message.author) {
      this.fetchAuthorDomain()
    }

    if (
      this.route.href.includes('/post/?id=') ||
      this.route.href.includes('/post?id=')
    ) {
      this.showFullText = true
    }

    // check if current user is a mod
    if (this.currentUserIsMod !== undefined && this.currentUserIsMod !== null && typeof this.currentUserIsMod === 'boolean') {
      this.currUserIsMod = this.currentUserIsMod
    } else {
      this.checkIfCurrenctUserIsMod()
    }
  },

  computed: {
    linkPreviewImage() {
      if (this.linkPreview?.image?.url) {
        return this.linkPreview.image.url
      } else {
        return null
      }
    },

    isComment() {
      if (this.mainItemId && isAddress(this.mainItemId)) {
        return true
      } else {
        return false
      }
    },

    isCurrentUserAuthor() {
      return String(this.message.author).toLowerCase() === String(this.address).toLowerCase()
    },

    isMainChatMessage() {
      if (!this.mainItemId) {
        return true
      } else {
        return false
      }
    },

    isReply() {
      if (this.mainItemId && !isAddress(this.mainItemId)) {
        return true
      } else {
        return false
      }
    },

    getArweaveUrl() {
      if (this.message?.url) {
        return this.message.url.replace("ar://", this.$config.public.arweaveGateway)
      }
    },

    showDomainOrAddress() {
      if (this.authorDomain) {
        return getTextWithoutBlankCharacters(this.authorDomain)
      } else {
        return this.shortenAddress(this.message.author)
      }
    },

    showDomainOrFullAddress() {
      if (this.authorDomain) {
        return this.authorDomain
      } else {
        return this.message.author
      }
    },

    timeSince() {
      if (!isNaN(this.message.createdAt)) {
        const timePosted = new Date(this.message.createdAt * 1000)
        const now = new Date()
        const secondsPast = (now.getTime() - timePosted.getTime()) / 1000

        if (secondsPast < 60) return 'now'
        if (secondsPast < 3600) return parseInt(secondsPast / 60) + 'min'
        if (secondsPast <= 86400) return parseInt(secondsPast / 3600) + 'h'
        if (secondsPast <= 2628000) return parseInt(secondsPast / 86400) + 'd'
        if (secondsPast <= 31536000) return parseInt(secondsPast / 2628000) + 'mo'
        if (secondsPast > 31536000) return parseInt(secondsPast / 31536000) + 'y'
      }

      return null
    },
  },

  methods: {
    async checkIfCurrenctUserIsMod() {
      if (!this.address) {
        return this.currUserIsMod = false
      }

      const value = fetchData(window, this.chatContext, 'mod-' + this.address, this.$config.public.expiryMods)

      if (value) {
        if (value?.isMod || value?.isMod === "true") {
          return this.currUserIsMod = true
        } else {
          return this.currUserIsMod = false
        }
      }

      try {
        const contractConfig = {
          address: this.chatContext,
          abi: [{ name: 'isUserMod', type: 'function', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' }],
          functionName: 'isUserMod',
          args: [this.address]
        }

        const isMod = await this.readData(contractConfig)
        storeData(window, this.chatContext, { isMod: Boolean(isMod) }, 'mod-' + this.address)
        return this.currUserIsMod = Boolean(isMod)
      } catch (error) {
        console.error(error)
        return this.currUserIsMod = false
      }
    },

    async deleteMessage() {
      if (this.address) {
        this.waitingDeleteMessage = true
        let toastWait;

        try {
          let txHash;
          let contractConfig;

          if (this.isReply) {
            contractConfig = {
              address: this.chatContext,
              abi: [{ name: 'deleteReply', type: 'function', inputs: [{ name: 'mainMsgIndex_', type: 'uint256' }, { name: 'replyMsgIndex_', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
              functionName: 'deleteReply',
              args: [BigInt(this.mainItemId), BigInt(this.message.index)]
            }
          } else if (this.isComment) {
            contractConfig = {
              address: this.chatContext,
              abi: [{ name: 'deleteComment', type: 'function', inputs: [{ name: 'subjectAddress_', type: 'address' }, { name: 'commentIndex_', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
              functionName: 'deleteComment',
              args: [this.mainItemId, BigInt(this.message.index)]
            }
          } else {
            contractConfig = {
              address: this.chatContext,
              abi: [{ name: 'deleteMessage', type: 'function', inputs: [{ name: 'mainMsgIndex_', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' }],
              functionName: 'deleteMessage',
              args: [BigInt(this.message.index)]
            }
          }

          txHash = await this.writeData(contractConfig)

          toastWait = this.toast(
            {
              component: WaitingToast,
              props: {
                text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
              },
            },
            {
              type: 'info',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            },
          )

          const receipt = await this.waitForTxReceipt(txHash)
          
          if (receipt.status === 'success') {
            this.toast.dismiss(toastWait)

            this.toast('You have successfully deleted the message.', {
              type: 'success',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            })

            document.getElementById('closeDeleteModal' + this.storageId).click()

            this.$emit('removePost', this.message.index)
          } else {
            this.toast.dismiss(toastWait)
            this.toast('Transaction has failed.', {
              type: 'error',
              onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + txHash, '_blank').focus(),
            })
            console.log(receipt)
          }
        } catch (error) {
          console.error(error)

          try {
            let extractMessage = error.message.split('Details:')[1]
            extractMessage = extractMessage.split('Version: viem')[0]
            extractMessage = extractMessage.replace(/"/g, '')
            extractMessage = extractMessage.replace('execution reverted:', 'Error:')

            console.log(extractMessage)

            this.toast(extractMessage, { type: 'error' })
          } catch (e) {
            
            this.toast("Transaction has failed.", {type: "error"});

          }
        } finally {
          this.toast.dismiss(toastWait)
          this.waitingDeleteMessage = false
        }
      }
    },

    async fetchAuthorDomain() {
      // find out if post author has a domain name
      this.authorAddress = this.message.author

      if (this.authorAddress) {
        // check storage if author's domain is already stored
        const storedDomain = fetchUsername(window, this.authorAddress)

        if (storedDomain) {
          this.authorDomain = storedDomain
        } else {
          const domainName = await getDomainName(this.authorAddress, window)

          if (domainName) {
            if (!domainName.endsWith(this.$config.public.tldName)) {
              this.authorDomain = domainName + this.$config.public.tldName
            } else {
              this.authorDomain = domainName
            }
            
            storeUsername(window, this.authorAddress, this.authorDomain)
          }
        }
      }
    },

    async fetchLinkPreview() {
      try {
        if (this.$config.public.linkPreviews) {
          const thisAppUrl = window.location.origin
          const firstLinkHttps = this.firstLink.replace('http://', 'https://')

          if (firstLinkHttps.startsWith(thisAppUrl.replace('http://', 'https://'))) {
            return
          }

          // check in localStorage if link preview is already stored (key is the link)
          const storedLinkPreviewString = localStorage.getItem(this.firstLink)

          if (storedLinkPreviewString) {
            this.linkPreview = JSON.parse(storedLinkPreviewString)
          } else {
            let fetcherService

            if (this.$config.public.linkPreviews === 'netlify') {
              fetcherService = thisAppUrl + '/.netlify/functions/linkPreviews?url=' + this.firstLink
            } else if (this.$config.public.linkPreviews === 'vercel') {
              fetcherService = thisAppUrl + '/api/linkPreviews?url=' + this.firstLink
            } else if (this.$config.public.linkPreviews === 'microlink') {
              fetcherService = 'https://api.microlink.io/?url=' + this.firstLink
            }

            if (fetcherService) {
              try {
              const resp = await $fetch(fetcherService).catch(error => error.data)

              let response = resp
              //console.log(resp)

              if (typeof resp === 'string') {
                // Check if the response is HTML (error page) instead of JSON
                if (resp.trim().startsWith('<!DOCTYPE') || resp.trim().startsWith('<html')) {
                  console.log('Error fetching link preview: Function returned HTML instead of JSON')
                  return
                }
                
                try {
                  response = JSON.parse(resp)
                } catch (parseError) {
                  console.log('Error parsing link preview response: ', parseError)
                  return
                }
              }

              if (response?.error) {
                console.log('Error fetching link preview: ', response['error'])
                return
              }

              if (response?.data) {
                this.linkPreview = response['data']

                // store link preview in localStorage
                if (this.linkPreview?.title) {
                  localStorage.setItem(this.firstLink, JSON.stringify(this.linkPreview))
                }
              }
            } catch (e) {
              console.log('Error fetching link preview: ', e)
            }
            }
          }
        }
      } catch (e) {
        console.log('Error fetching link preview: ', e)
      }
    },

    async fetchMessageFromStorage() {
      // TODO: check if message is already in browser local storage (key is message.url)

      let response;
      if (this.message.url.startsWith('ar://')) {
        response = await axios.get(`${this.$config.public.arweaveGateway}${this.storageId}`)
      } else if (this.message.url.startsWith('ipfs://')) {
        response = await axios.get(`${this.$config.public.ipfsGateway}${this.storageId}`)
      } else if (this.message.url.startsWith('http')) {
        response = await axios.get(this.message.url)
      }

      this.messageFromStorage = response.data

      // TODO: store message in browser local storage

      this.parseMessageText()
    },

    handleCloseClick() {
      // Remove focus from the close button to prevent aria-hidden warning
      const closeButton = document.getElementById('closeDeleteModal' + this.storageId)
      if (closeButton) {
        closeButton.blur()
      }
    },

    parseMessageText() {
      let postText = this.messageFromStorage.text

      postText = DOMPurify.sanitize(postText, {
        ALLOWED_TAGS: ['li', 'ul', 'ol', 'br', 'em', 'strong', 'i', 'b'],
        ALLOWED_ATTR: [],
      })

      if (this.$config.public.linkPreviews) {
        // get first link in post
        this.firstLink = findFirstUrl(postText)
        if (this.firstLink) {
          this.fetchLinkPreview()
        }
      }

      postText = imgParsing(postText)
      postText = imgWithoutExtensionParsing(postText)
      postText = youtubeParsing(postText)
      postText = urlParsing(postText)

      this.parsedText = postText.replace(/(\r\n|\n|\r)/gm, '<br/>')
    },

  },

  setup() {
    const route = useRoute()
    const { address, chainId, isActivated, shortenAddress } = useAccountData()
    const { readData, writeData, waitForTxReceipt } = useWeb3()
    const toast = useToast()

    return { 
      address, 
      chainId, 
      isActivated, 
      route, 
      shortenAddress, 
      toast,
      readData,
      writeData,
      waitForTxReceipt
    }
  },

  
}
</script>
