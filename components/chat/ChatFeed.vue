<template>
  <div class="scroll-500">
    <!-- Message Input Box -->
    <div class="card mb-2 border" v-if="!hideCommentBox">
      <div class="card-body">
        <div class="form-group mt-2 mb-2">
          <textarea
            v-model="messageText"
            :disabled="!isConnected || !isSupportedChain || !hasDomainOrNotRequired"
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
                $config.public.tenorApiKey != '' &&
                isConnected &&
                isSupportedChain &&
                hasDomainOrNotRequired
              "
              @insertGif="insertImage"
            />

            <!-- Sticker button 
            <TenorStickerSearch 
              v-if="$config.public.tenorApiKey != '' && isConnected && isSupportedChain && hasDomainOrNotRequired"  
              @insertSticker="insertImage"
            />
            -->

            <!-- Upload IMG button -->
            <button
              v-if="
                isConnected &&
                $config.public.fileUploadEnabled !== '' &&
                isSupportedChain &&
                hasDomainOrNotRequired
              "
              class="btn btn-outline-primary me-2 mt-2 btn-sm"
              data-bs-toggle="modal"
              :data-bs-target="'#fileUploadModal' + $.uid"
              title="Upload image to your post"
            >
              <i class="bi bi-file-earmark-image-fill"></i>
              IMG
            </button>

            <!-- Upload Image Modal -->
            <FileUploadModal
              v-if="isConnected && isSupportedChain && hasDomainOrNotRequired"
              @processFileUrl="insertImage"
              title="Upload image"
              infoText="Upload an image."
              :storageType="$config.public.fileUploadStorageType"
              :componentId="$.uid"
              :maxFileSize="$config.public.fileUploadSizeLimit"
            />
            <!-- END Upload Image Modal -->

            <!-- Emoji Picker -->
            <EmojiPicker
              v-if="isConnected && isSupportedChain && hasDomainOrNotRequired"
              @updateEmoji="insertEmoji"
            />
          </div>

          <div>
            <!-- Create Message button -->
            <button
              v-if="isConnected && isSupportedChain && hasDomainOrNotRequired"
              :disabled="!messageText || waitingCreateMessage || arweaveBalanceTooLow"
              class="btn btn-primary me-2 mt-2"
              @click="createMessage"
            >
              <span v-if="waitingCreateMessage" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Submit
            </button>

            <!-- Get Username button -->
            <button v-if="isConnected && isSupportedChain && !hasDomainOrNotRequired" class="btn btn-primary disabled">
              Get yourself a {{ $config.public.tldName }} name to post <i class="bi bi-arrow-right"></i>
            </button>

            <!-- Connect Wallet button -->
            <ConnectWalletButton v-if="!isConnected" class="btn-primary" btnText="Connect wallet" />

            <!-- Switch Chain button -->
            <SwitchChainButton v-if="isConnected && !isSupportedChain" :navbar="false" :dropdown="false" />
          </div>
        </div>

        <div class="d-flex mt-2 row">
          <img
            v-if="showImagePreview"
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
import EmojiPicker from '@/components/EmojiPicker.vue'
import 'emoji-mart-vue-fast/css/emoji-mart.css'
import { isAddress, formatEther } from 'viem'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useAccount, useConfig } from '@wagmi/vue'

import ConnectWalletButton from '@/components/connect/ConnectWalletButton.vue'
import SwitchChainButton from '@/components/connect/SwitchChainButton.vue'
import WaitingToast from '@/components/WaitingToast'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import FileUploadModal from '@/components/storage/FileUploadModal.vue'
import TenorGifSearch from '@/components/tenor/TenorGifSearch.vue'
import TenorStickerSearch from '@/components/tenor/TenorStickerSearch.vue'
import { getArweaveUrlAsHttp, getWorkingUrl } from '@/utils/fileUtils'
import { getAllImagesFromText } from '@/utils/textUtils'
import { fetchData, storeData } from '@/utils/browserStorageUtils'
import { useAccountData } from '@/composables/useAccountData'
import { useSiteSettings } from '@/composables/useSiteSettings'
import { readData, writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

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
      showImagePreview: true,
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
    arweaveBalanceTooLow() {
      return this.arweaveBalance < this.$config.public.arweaveMinBalance
    },

    createMessagePlaceholder() {
      if (this.isConnected) {
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
      if (this.$config.public.domainRequiredToPost) {
        if (this.domainName) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },

    isCommentFeed() {
      if (this.mainItemId && isAddress(this.mainItemId)) {
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
      if (this.mainItemId && !isAddress(this.mainItemId)) {
        return true
      } else {
        return false
      }
    },

    isSupportedChain() {
      if (this.chainId === this.$config.public.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    async checkIfCurrenctUserIsMod() {
      if (this.address) {
        const value = fetchData(window, this.chatContext, 'mod-' + this.address, this.$config.public.expiryMods)

        if (value) {
          if (value?.isMod || value?.isMod === "true") {
            return this.currentUserIsMod = true
          } else {
            return this.currentUserIsMod = false
          }
        }

        try {
          const contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [{ internalType: 'address', name: '', type: 'address' }],
              name: 'isUserMod',
              outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'isUserMod',
            args: [this.address]
          }

          const isMod = await readData(contractConfig)
          storeData(window, this.chatContext, { isMod: Boolean(isMod) }, 'mod-' + this.address)
          return this.currentUserIsMod = Boolean(isMod)
        } catch (error) {
          console.error(error)
          return this.currentUserIsMod = false
        }
      }
    },

    async createMessage() {
      this.waitingCreateMessage = true

      if (!this.isSupportedChain || !this.hasDomainOrNotRequired) {
        this.toast('Please make sure you are on the supported chain and have a ' + this.$config.public.tldName + ' domain to post.', {
          type: 'error',
        })
        return
      }

      const storageUrl = await this.uploadToChatStorage(this.messageText)

      if (!storageUrl) {
        this.toast('Failed to upload message to storage.', {
          type: 'error',
        })
        return
      }

      let toastWait;
      
      try {
        let contractConfig
        let tx

        if (this.isReplyFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'uint256', name: 'mainMsgIndex_', type: 'uint256' },
                { internalType: 'string', name: 'url_', type: 'string' }
              ],
              name: 'createReply',
              outputs: [],
              stateMutability: 'payable',
              type: 'function'
            }],
            functionName: 'createReply',
            args: [BigInt(this.mainItemId), storageUrl],
            value: BigInt(this.priceWei)
          }
        } else if (this.isCommentFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'address', name: 'subjectAddress_', type: 'address' },
                { internalType: 'string', name: 'url_', type: 'string' }
              ],
              name: 'createComment',
              outputs: [],
              stateMutability: 'payable',
              type: 'function'
            }],
            functionName: 'createComment',
            args: [this.mainItemId, storageUrl],
            value: BigInt(this.priceWei)
          }
        } else {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [{ internalType: 'string', name: 'url_', type: 'string' }],
              name: 'createMessage',
              outputs: [],
              stateMutability: 'payable',
              type: 'function'
            }],
            functionName: 'createMessage',
            args: [storageUrl],
            value: BigInt(this.priceWei)
          }
        }

        tx = await writeData(contractConfig)

        toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + tx, '_blank').focus(),
          },
        )

        const receipt = await waitForTxReceipt(tx)
        
        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait)

          this.toast('You have successfully submitted a new message.', {
            type: 'success',
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + tx, '_blank').focus(),
          })

          // get main message or reply count
          let fullThreadLength

          if (this.isReplyFeed) {
            const replyCountConfig = {
              address: this.chatContext,
              abi: [{
                inputs: [{ internalType: 'uint256', name: 'mainMsgIndex_', type: 'uint256' }],
                name: 'getReplyCount',
                outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
              }],
              functionName: 'getReplyCount',
              args: [BigInt(this.mainItemId)]
            }
            
            fullThreadLength = await readData(replyCountConfig)

          } else if (this.isCommentFeed) {
            const commentCountConfig = {
              address: this.chatContext,
              abi: [{
                inputs: [{ internalType: 'address', name: 'subjectAddress_', type: 'address' }],
                name: 'getCommentCount',
                outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
              }],
              functionName: 'getCommentCount',
              args: [this.mainItemId]
            }
            
            fullThreadLength = await readData(commentCountConfig)

          } else {
            const mainMessageCountConfig = {
              address: this.chatContext,
              abi: [{
                inputs: [],
                name: 'getMainMessageCount',
                outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                stateMutability: 'view',
                type: 'function'
              }],
              functionName: 'getMainMessageCount',
              args: []
            }
            
            fullThreadLength = await readData(mainMessageCountConfig)
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
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl + '/tx/' + tx, '_blank').focus(),
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
        let contractConfig
        let msgs

        let fromIndex = this.lastFetchedIndex - this.pageLength;
        let queryLength = this.pageLength;

        if (fromIndex < 0) {
          fromIndex = 0;
          queryLength = this.lastFetchedIndex - fromIndex;
        }

        if (this.isReplyFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'uint256', name: 'mainMsgIndex_', type: 'uint256' },
                { internalType: 'uint256', name: 'fromIndex_', type: 'uint256' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchReplies',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'uint256', name: 'repliesCount', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Message[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchReplies',
            args: [true, this.mainItemId, fromIndex, queryLength]
          }
        } else if (this.isCommentFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'address', name: 'subjectAddress_', type: 'address' },
                { internalType: 'uint256', name: 'fromIndex_', type: 'uint256' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchComments',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Comment[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchComments',
            args: [true, this.mainItemId, fromIndex, queryLength]
          }
        } else {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'uint256', name: 'fromIndex_', type: 'uint256' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchMainMessages',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'uint256', name: 'repliesCount', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Message[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchMainMessages',
            args: [true, BigInt(fromIndex), BigInt(queryLength)]
          }
        }

        msgs = await readData(contractConfig)

        let msgsToAdd = [];
        for (let i = 0; i < msgs.length; i++) {
          const msg = msgs[i];
          if (!msg.deleted) {
            const messageObj = {
              author: msg.author,
              url: msg.url,
              createdAt: Number(msg.createdAt),
              deleted: msg.deleted,
              index: Number(msg.index),
            }
            
            // Add repliesCount only if it's not a comment feed
            if (!this.isCommentFeed) {
              messageObj.repliesCount = Number(msg.repliesCount)
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

        if (this.lastFetchedIndex == 0) {
          this.showLoadMore = false;
        } else {
          this.showLoadMore = true;
        }
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
        let contractConfig
        let msgs
        
        if (this.isReplyFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'uint256', name: 'mainMsgIndex_', type: 'uint256' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchLastReplies',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'uint256', name: 'repliesCount', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Message[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchLastReplies',
            args: [true, this.mainItemId, this.pageLength]
          }
        } else if (this.isCommentFeed) {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'address', name: 'subjectAddress_', type: 'address' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchLastComments',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Comment[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchLastComments',
            args: [true, this.mainItemId, this.pageLength]
          }
        } else {
          contractConfig = {
            address: this.chatContext,
            abi: [{
              inputs: [
                { internalType: 'bool', name: 'includeDeleted_', type: 'bool' },
                { internalType: 'uint256', name: 'length_', type: 'uint256' }
              ],
              name: 'fetchLastMainMessages',
              outputs: [{
                components: [
                  { internalType: 'address', name: 'author', type: 'address' },
                  { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
                  { internalType: 'bool', name: 'deleted', type: 'bool' },
                  { internalType: 'uint256', name: 'index', type: 'uint256' },
                  { internalType: 'uint256', name: 'repliesCount', type: 'uint256' },
                  { internalType: 'string', name: 'url', type: 'string' }
                ],
                internalType: 'struct ChatFeed.Message[]',
                name: '',
                type: 'tuple[]'
              }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'fetchLastMainMessages',
            args: [true, BigInt(this.pageLength)]
          }
        }

        msgs = await readData(contractConfig)

        let msgsToAdd = []
        for (let i = 0; i < msgs.length; i++) {
          const msg = msgs[i];
          if (!msg.deleted) { // only add message if it is not marked as deleted
            const messageObj = {
              author: msg.author,
              url: msg.url,
              createdAt: Number(msg.createdAt),
              deleted: msg.deleted,
              index: Number(msg.index),
            }
            
            // Add repliesCount only if it's not a comment feed
            if (!this.isCommentFeed) {
              messageObj.repliesCount = Number(msg.repliesCount)
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
        }
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
        this.price = formatEther(this.priceWei)
        return
      }

      try {
        const contractConfig = {
          address: this.chatContext,
          abi: [{
            inputs: [],
            name: 'price',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function'
          }],
          functionName: 'price',
          args: []
        }
        
        this.priceWei = await readData(contractConfig)
        
        // Handle case where price might be 0 or undefined
        if (this.priceWei === null || this.priceWei === undefined) {
          this.priceWei = '0'
          this.price = '0'
        } else {
          this.price = formatEther(this.priceWei)
        }

        // store priceWei in session storage
        window.sessionStorage.setItem(this.chatContext + '-price', this.priceWei)
      } catch (error) {
        console.error('Failed to get message price:', error)
        // Set default values on error
        this.priceWei = '0'
        this.price = '0'
      }
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
        } else {
          this.showImagePreview = false
        }
      }

      if (imageUrl.startsWith('ar://')) {
        // if image url still starts with ar://, then convert it to http
        imageUrl = getArweaveUrlAsHttp(imageUrl)
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
      if (this.$config.public.chat.storage === 'arweave') {
        const thisAppUrl = window.location.origin

        let fetcherService
        if (this.$config.public.fileUploadTokenService === 'netlify') {
          fetcherService = thisAppUrl + '/.netlify/functions/arweaveUploader'
        } else if (this.$config.public.fileUploadTokenService === 'vercel') {
          fetcherService = thisAppUrl + '/api/arweaveUploader'
        }

        // create JSON file together with file type and file name, and convert it to base64
        const messageObj = {
          author: this.address,
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
    const config = useConfig()
    const { address, chainId, isConnected } = useAccount({ config })
    const { domainName } = useAccountData()
    const { arweaveBalance } = useSiteSettings()
    const toast = useToast()

    return { 
      address,
      arweaveBalance,
      chainId,
      domainName,
      isConnected,
      toast, 
    }
  },
}
</script>
