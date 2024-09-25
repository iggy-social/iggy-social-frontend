<template>
  <div class="scroll-500">
    <!-- Message Input Box -->
    <div class="card mb-2 border" v-if="!hideCommentBox">
      <div class="card-body">
        <div class="form-group mt-2 mb-2">
          <textarea
            v-model="messageText"
            :disabled="!isActivated || !isSupportedChain || !hasDomainOrNotRequired"
            class="form-control"
            id="exampleTextarea"
            rows="5"
            :placeholder="createMessagePlaceholder"
            v-on:keydown.ctrl.enter="createMessage"
          ></textarea>
        </div>

        <div class="d-flex justify-content-between">
          <div>
            <!-- GIF button -->
            <TenorGifSearch
              v-if="
                $config.tenorApiKey != '' &&
                isActivated &&
                isSupportedChain &&
                hasDomainOrNotRequired
              "
              @insertGif="insertImage"
            />

            <!-- Sticker button 
            <TenorStickerSearch 
              v-if="$config.tenorApiKey != '' && isActivated && isSupportedChain && hasDomainOrNotRequired"  
              @insertSticker="insertImage"
            />
            -->

            <!-- Upload IMG button -->
            <button
              v-if="
                isActivated &&
                $config.fileUploadEnabled !== '' &&
                isSupportedChain &&
                hasDomainOrNotRequired
              "
              class="btn btn-outline-primary me-2 mt-2 btn-sm"
              data-bs-toggle="modal"
              :data-bs-target="'#fileUploadModal' + $.uid"
            >
              <i class="bi bi-file-earmark-image-fill"></i>
              IMG
            </button>

            <!-- Upload Image Modal -->
            <FileUploadModal
              v-if="isActivated && isSupportedChain && hasDomainOrNotRequired"
              @processFileUrl="insertImage"
              title="Upload image"
              infoText="Upload an image."
              :storageType="$config.fileUploadStorageType"
              :componentId="$.uid"
              :maxFileSize="$config.fileUploadSizeLimit"
            />
            <!-- END Upload Image Modal -->

            <!-- Emoji Picker -->
            <EmojiPicker
              v-if="isActivated && isSupportedChain && hasDomainOrNotRequired"
              @updateEmoji="insertEmoji"
            />
          </div>

          <div>
            <!-- Create Message button -->
            <button
              v-if="isActivated && isSupportedChain && hasDomainOrNotRequired"
              :disabled="!messageText || waitingCreateMessage"
              class="btn btn-primary me-2 mt-2"
              @click="createMessage"
            >
              <span v-if="waitingCreateMessage" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Submit
            </button>

            <!-- Get Username button -->
            <button v-if="isActivated && isSupportedChain && !hasDomainOrNotRequired" class="btn btn-primary disabled">
              Get yourself a {{ $config.tldName }} name to post <i class="bi bi-arrow-right"></i>
            </button>

            <!-- Connect Wallet button -->
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />

            <!-- Switch Chain button -->
            <SwitchChainButton v-if="isActivated && !isSupportedChain" :navbar="false" :dropdown="false" />
          </div>
        </div>

        <div class="d-flex mt-2 row">
          <img
            v-for="(imgLink, index) in getAllImagesFromText(messageText)"
            :src="imgLink"
            :key="index"
            class="img-fluid img-thumbnail m-1 col-2"
          />
        </div>
      </div>
    </div>

    <!-- Main message thread -->
    <div v-if="messages && isMainChatFeed">
      <ChatMessage
        @removePost="removePost"
        v-for="message in messages"
        :chatContext="chatContext"
        :key="message.url"
        :message="message"
        :currentUserIsMod="currentUserIsMod"
      />
    </div>

    <!-- Replies & Comments -->
    <div v-if="messages && !isMainChatFeed">
      <ChatMessage
        @removePost="removePost"
        v-for="message in messages"
        :chatContext="chatContext"
        :key="message.url"
        :mainItemId="mainItemId"
        :message="message"
        :currentUserIsMod="currentUserIsMod"
      />
    </div>

    <div class="d-flex justify-content-center mt-5 mb-4" v-if="messages.length === 0 && !waitingLoadMessages">
      <p>No messages yet. Be the first to post!</p>
    </div>

    <div class="d-flex justify-content-center mb-3" v-if="waitingLoadMessages">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>

    <div class="d-grid gap-2 col-6 mx-auto mb-5" v-if="showLoadMore">
      <button class="btn btn-primary" type="button" @click="getAdditionalMessages">Load more messages</button>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import EmojiPicker from '~/components/EmojiPicker.vue'
import 'emoji-mart-vue-fast/css/emoji-mart.css'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useEthers } from '~/store/ethers'
import { useSiteStore } from '~/store/site'
import { useUserStore } from '~/store/user'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import ChatMessage from '~/components/chat/ChatMessage.vue'
import FileUploadModal from '~/components/storage/FileUploadModal.vue'
import TenorGifSearch from '~/components/tenor/TenorGifSearch.vue'
import TenorStickerSearch from '~/components/tenor/TenorStickerSearch.vue'
import { getWorkingUrl } from '~/utils/ipfsUtils'
import { getAllImagesFromText } from '~/utils/textUtils'
import { fetchData, storeData } from '~/utils/storageUtils'

export default {
  name: 'ChatFeed',
  props: [
    'chatContext', // address of the chat context contract
    'hideCommentBox', // if true, we'll hide the comment box
    'mainItemId', // (optional) this is either a main message index or an address of an NFT collection or similar
  ],

  components: {
    ChatMessage,
    ConnectWalletButton,
    FileUploadModal,
    SwitchChainButton,
    TenorGifSearch,
    TenorStickerSearch,
    EmojiPicker,
  },

  data() {
    return {
      currentUserIsMod: null, // leave it as null
      deletedCount: 0,
      lastFetchedIndex: 0,
      messages: [],
      messageText: null,
      pageLength: 10,
      price: 0, // price to post a message (in ETH)
      priceWei: 0, // price to post a message (in wei)
      showLoadMore: true,
      waitingCreateMessage: false,
      waitingLoadMessages: false,
    }
  },

  mounted() {
    this.getInitialMessages()
    this.getMessagePrice()
    this.checkIfCurrenctUserIsMod()
  },

  computed: {
    createMessagePlaceholder() {
      if (this.isActivated) {
        if (this.isReplyFeed) {
          return 'Post your reply'
        } else if (this.isCommentFeed) {
          return 'Post your comment'
        } else {
          return "What's happening?"
        }
      } else {
        return "What's happening? (Please connect wallet to post messages.)"
      }
    },

    hasDomainOrNotRequired() {
      if (this.$config.domainRequiredToPost) {
        if (this.userStore.getDefaultDomain) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },

    isCommentFeed() {
      if (this.mainItemId && ethers.utils.isAddress(this.mainItemId)) {
        return true
      } else {
        return false
      }
    },

    isMainChatFeed() {
      if (!this.mainItemId) {
        return true
      } else {
        return false
      }
    },

    isReplyFeed() {
      if (this.mainItemId && !ethers.utils.isAddress(this.mainItemId)) {
        return true
      } else {
        return false
      }
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    async checkIfCurrenctUserIsMod() {
      if (this.address) {
        const value = fetchData(window, this.chatContext, 'mod-' + this.address, this.$config.expiryMods)

        if (value) {
          if (value?.isMod || value?.isMod === "true") {
            return this.currentUserIsMod = true
          } else {
            return this.currentUserIsMod = false
          }
        }

        const provider = this.$getFallbackProvider(this.$config.supportedChainId)
        const intrfc = new ethers.utils.Interface(['function isUserMod(address) external view returns (bool)'])
        const contract = new ethers.Contract(this.chatContext, intrfc, provider)

        try { 
          const isMod = await contract.isUserMod(this.address)
          storeData(window, this.chatContext, { isMod: Boolean(isMod) }, 'mod-' + this.address) // TODO: change 0 to something else (e.g. 1 week)
          return this.currentUserIsMod = Boolean(isMod)
        } catch (error) {
          console.error(error)
          return this.currentUserIsMod = false
        }
      }
    },

    async createMessage() {
      this.waitingCreateMessage = true

      if (!this.signer || !this.isSupportedChain || !this.hasDomainOrNotRequired) {
        this.toast('Please connect wallet to post messages, make sure you are on the supported chain and have a ' + $config.tldName + ' domain to post.', {
          type: 'error',
        })
        return
      }

      const storageUrl = await this.uploadToChatStorage(this.messageText)

      //console.log(storageUrl)
      //return this.waitingCreateMessage = false // TODO: remove

      if (!storageUrl) {
        this.toast('Failed to upload message to storage.', {
          type: 'error',
        })
        return
      }
      
      try {
        const intrfc = new ethers.utils.Interface([
          'function createComment(address subjectAddress_, string memory url_) external payable',
          'function createMessage(string memory url_) external payable',
          'function createReply(uint256 mainMsgIndex_, string memory url_) external payable',
          'function getCommentCount(address subjectAddress_) external view returns (uint256)',
          'function getMainMessageCount() external view returns (uint256)',
          'function getReplyCount(uint256 mainMsgIndex_) external view returns (uint256)'
        ])

        const contract = new ethers.Contract(this.chatContext, intrfc, this.signer)

        let tx;

        if (this.isReplyFeed) {
          tx = await contract.createReply(this.mainItemId, storageUrl, { value: this.priceWei })
        } else if (this.isCommentFeed) {
          tx = await contract.createComment(this.mainItemId, storageUrl, { value: this.priceWei })
        } else {
          tx = await contract.createMessage(storageUrl, { value: this.priceWei })
        }

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          },
        )

        const receipt = await tx.wait()
        
        if (receipt.status === 1) {
          this.toast.dismiss(toastWait)

          this.toast('You have successfully submitted a new message.', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          // get main message or reply count
          let fullThreadLength;
          if (this.isReplyFeed) {
            fullThreadLength = await contract.getReplyCount(this.mainItemId)
          } else if (this.isCommentFeed) {
            fullThreadLength = await contract.getCommentCount(this.mainItemId)
          } else {
            fullThreadLength = await contract.getMainMessageCount()
          }

          // prepend message to messages array
          this.messages.unshift({
            author: this.address,
            url: storageUrl,
            createdAt: Math.floor(Date.now() / 1000),
            deleted: false,
            repliesCount: 0,
            index: Number(fullThreadLength)-1,
          })

          // empty messageText
          this.messageText = null
        } else {
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (error) {
        console.error(error)

        try {
          let extractMessage = error.message.split('reason=')[1]
          extractMessage = extractMessage.split(', method=')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }
      } finally {
        this.waitingCreateMessage = false
      }
    },

    async getAdditionalMessages() {
      this.waitingLoadMessages = true;

      if (this.lastFetchedIndex === 0) {
        this.toast('No more messages to load', { type: 'info' });
        return;
      }

      try {
        const provider = this.$getFallbackProvider(this.$config.supportedChainId);

        const intrfc = new ethers.utils.Interface([
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "address", "name": "subjectAddress_", "type": "address"},
              {"internalType": "uint256", "name": "fromIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchComments",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Comment[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "uint256", "name": "fromIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchMainMessages",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "uint256", "name": "repliesCount", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Message[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "uint256", "name": "mainMsgIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "fromIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchReplies",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "uint256", "name": "repliesCount", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Message[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ]);

        const contract = new ethers.Contract(this.chatContext, intrfc, provider);

        let msgs;

        let fromIndex = this.lastFetchedIndex - this.pageLength;
        let queryLength = this.pageLength;

        if (fromIndex < 0) {
          fromIndex = 0;
          queryLength = this.lastFetchedIndex - fromIndex;
        }

        if (this.isReplyFeed) {
          msgs = await contract.fetchReplies(true, this.mainItemId, fromIndex, queryLength);
        } else if (this.isCommentFeed) {
          msgs = await contract.fetchComments(true, this.mainItemId, fromIndex, queryLength);
        } else {
          msgs = await contract.fetchMainMessages(true, fromIndex, queryLength);
        }

        let msgsToAdd = [];
        for (let i = 0; i < msgs.length; i++) {
          const msg = msgs[i];
          if (!msg.deleted) {
            const messageObj = {
              author: msg.author,
              url: msg.url,
              createdAt: msg.createdAt.toNumber(),
              deleted: msg.deleted,
              index: msg.index.toNumber(),
            }
            
            // Add repliesCount only if it's not a comment feed
            if (!this.isCommentFeed) {
              messageObj.repliesCount = msg.repliesCount.toNumber()
            }
            
            msgsToAdd.push(messageObj)
          } else {
            this.deletedCount++;
          }
        }

        // Reverse the array to maintain chronological order
        msgsToAdd.reverse();

        this.messages = [...this.messages, ...msgsToAdd];

        if (msgsToAdd.length < queryLength) {
          this.showLoadMore = false;
        }

        this.lastFetchedIndex = msgsToAdd[msgsToAdd.length - 1].index;
        // console.log("lastFetchedIndex additional messages:", this.lastFetchedIndex);

        if (this.lastFetchedIndex === 0) {
          this.showLoadMore = false;
        }

        //console.log(this.messages);
      } catch (error) {
        console.error(error);
        this.toast('Failed to load additional messages', { type: 'error' });
        this.showLoadMore = false;
      } finally {
        this.waitingLoadMessages = false;
      }
    },

    async getInitialMessages() {
      this.waitingLoadMessages = true

      try {
        const provider = this.$getFallbackProvider(this.$config.supportedChainId)

        const intrfc = new ethers.utils.Interface([
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchLastMainMessages",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "uint256", "name": "repliesCount", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Message[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "uint256", "name": "mainMsgIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchLastReplies",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "uint256", "name": "repliesCount", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Message[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"internalType": "bool", "name": "includeDeleted_", "type": "bool"},
              {"internalType": "address", "name": "subjectAddress_", "type": "address"},
              {"internalType": "uint256", "name": "length_", "type": "uint256"}
            ],
            "name": "fetchLastComments",
            "outputs": [
              {
                "components": [
                  {"internalType": "address", "name": "author", "type": "address"},
                  {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                  {"internalType": "bool", "name": "deleted", "type": "bool"},
                  {"internalType": "uint256", "name": "index", "type": "uint256"},
                  {"internalType": "string", "name": "url", "type": "string"}
                ],
                "internalType": "struct ChatFeed.Comment[]",
                "name": "",
                "type": "tuple[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ])

        const contract = new ethers.Contract(this.chatContext, intrfc, provider)

        let msgs;
        
        if (this.isReplyFeed) {
          msgs = await contract.fetchLastReplies(true, this.mainItemId, this.pageLength)
        } else if (this.isCommentFeed) {
          msgs = await contract.fetchLastComments(true, this.mainItemId, this.pageLength)
        } else {
          msgs = await contract.fetchLastMainMessages(true, this.pageLength)
        }

        let msgsToAdd = []
        for (let i = 0; i < msgs.length; i++) {
          const msg = msgs[i];
          if (!msg.deleted) { // only add message if it is not marked as deleted
            const messageObj = {
              author: msg.author,
              url: msg.url,
              createdAt: msg.createdAt.toNumber(),
              deleted: msg.deleted,
              index: msg.index.toNumber(),
            }
            
            // Add repliesCount only if it's not a comment feed
            if (!this.isCommentFeed) {
              messageObj.repliesCount = msg.repliesCount.toNumber()
            }
            
            msgsToAdd.push(messageObj)
          } else {
            this.deletedCount++;
          }
        }

        // reverse the array
        msgsToAdd.reverse()

        this.messages = msgsToAdd;

        if (msgs.length < this.pageLength) {
          this.showLoadMore = false
        }

        if (this.messages.length > 0) {
          this.lastFetchedIndex = this.messages[this.messages.length - 1].index;
          //console.log("lastFetchedIndex initial messages:", this.lastFetchedIndex);
        }

        //console.log(this.messages)
      } catch (error) {
        console.error(error)
      } finally {
        this.waitingLoadMessages = false
      }
    },

    async getMessagePrice() {
      // fetch priceWei from session storage
      const priceWei = window.sessionStorage.getItem(this.chatContext + '-price')

      if (priceWei) {
        this.priceWei = priceWei
        this.price = ethers.utils.formatEther(this.priceWei)
        return
      }

      const provider = this.$getFallbackProvider(this.$config.supportedChainId)

      const intrfc = new ethers.utils.Interface([
        'function price() external view returns (uint256)'
      ])

      const contract = new ethers.Contract(this.chatContext, intrfc, provider)
      
      this.priceWei = await contract.price()
      this.price = ethers.utils.formatEther(this.priceWei)

      // store priceWei in session storage
      window.sessionStorage.setItem(this.chatContext + '-price', this.priceWei)
    },

    insertEmoji(emoji) {
      if (!this.messageText) {
        this.messageText = emoji
      } else {
        this.messageText += emoji
      }
    },

    async insertImage(imageUrl) {
      if (imageUrl.startsWith('ipfs://') || imageUrl.startsWith('ar://')) {
        const imgRes = await getWorkingUrl(imageUrl)

        if (imgRes.success) {
          imageUrl = imgRes.url
        }
      }

      if (
        imageUrl.endsWith('.JPG') ||
        imageUrl.endsWith('.PNG') ||
        imageUrl.endsWith('.JPEG') ||
        imageUrl.endsWith('.GIF')
      ) {
        imageUrl = imageUrl
          .replace('.JPG', '.jpg')
          .replace('.PNG', '.png')
          .replace('.JPEG', '.jpeg')
          .replace('.GIF', '.gif')
      }

      // add image url to messageText
      if (!this.messageText) {
        this.messageText = imageUrl + ' '
      } else {
        this.messageText = this.messageText + ' ' + imageUrl + ' '
      }
    },

    async removePost(messageId) {
      // callback hook for ChatMessage component
      // listens for delete event and removes message from feed
      this.messages = this.messages.filter(m => Number(m.index) !== Number(messageId))
    },

    async uploadToChatStorage(messageText) {
      // TODO: add upload to chat storage (e.g. Arweave)
      if (this.$config.chat.storage === 'arweave') {
        const thisAppUrl = window.location.origin

        let fetcherService
        if (this.$config.fileUploadTokenService === 'netlify') {
          fetcherService = thisAppUrl + '/.netlify/functions/arweaveUploader'
        } else if (this.$config.fileUploadTokenService === 'vercel') {
          fetcherService = thisAppUrl + '/api/arweaveUploader'
        }

        // create JSON file together with file type and file name, and convert it to base64
        const messageObj = {
          author: this.userStore.address,
          text: messageText,
          timestamp: Math.floor(Date.now() / 1000)
        }

        // Use TextEncoder to convert messageObj to base64
        const encoder = new TextEncoder()
        const fileData = btoa(String.fromCharCode.apply(null, encoder.encode(JSON.stringify(messageObj))))

        // create file with file type and file name
        const fileType = 'application/json'
        const fileName = `${messageObj.author}-${messageObj.timestamp}.json`

        // upload file to Arweave
        const resp = await axios.post(fetcherService, {
          fileData,
          fileName,
          fileType
        })

        const transactionId = resp.data.transactionId
        let fileUri = `ar://${transactionId}`
        return fileUri
      }
    },

  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast()
    const siteStore = useSiteStore()
    const userStore = useUserStore()

    return { address, chainId, isActivated, signer, toast, siteStore, userStore }
  },
}
</script>