<template>
  <div>
    <Head>
      <Meta name="description" :content="'Check out this chat post on ' + $config.projectName + '!'" />

      <Meta property="og:image" :content="$config.projectUrl + $config.previewImagePost" />
      <Meta property="og:description" :content="'Check out this chat post on ' + $config.projectName + '!'" />

      <Meta name="twitter:image" :content="$config.projectUrl + $config.previewImagePost" />
      <Meta name="twitter:description" :content="'Check out this chat post on ' + $config.projectName + '!'" />
    </Head>
  </div>

  <div :key="message?.url">
    <!-- Main message -->
    <ChatMessage v-if="message" :message="message" :chatContext="getChatContext" />

    <!-- reply -->
    <ChatMessage v-if="reply" :message="reply" :mainItemId="getMessageId" :chatContext="getChatContext" />

    <!-- Chat feed of replies -->
    <ChatFeed v-if="!isReply" :chatContext="getChatContext" :mainItemId="getMessageId" />

    <!-- See other replies button -->
    <NuxtLink v-if="isReply" :to="mainMessagePage" class="btn btn-primary">See other replies</NuxtLink>
  </div>
  
</template>

<script>
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import ChatFeed from '~/components/chat/ChatFeed.vue'
import ChatMessage from '~/components/chat/ChatMessage.vue'

export default {
  data() {
    return {
      message: null,
      reply: null,
    }
  },

  components: {
    ChatFeed,
    ChatMessage,
  },

  created() {
    this.getMessage()
  },

  computed: {
    getChatContext() {
      return this.route.query.context
    },

    getMessageId() {
      return this.route.query.id
    },

    getReplyId() {
      return this.route.query.reply
    },

    isReply() {
      if (this.route.query.reply) {
        return true
      } else {
        return false
      }
    },

    mainMessagePage() {
      return `/post/?id=${this.getMessageId}&context=${this.getChatContext}`
    }
  },

  methods: {
    async getMessage() {
      this.message = null
      this.reply = null

      try {
        const provider = this.$getFallbackProvider(this.$config.supportedChainId);

        const intrfc = new ethers.utils.Interface([
          {
            "inputs": [{"internalType": "uint256", "name": "mainMsgIndex_", "type": "uint256"}],
            "name": "getMainMessage",
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
                "internalType": "struct ChatFeed.Message",
                "name": "",
                "type": "tuple"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {"internalType": "uint256", "name": "mainMsgIndex_", "type": "uint256"},
              {"internalType": "uint256", "name": "replyMsgIndex_", "type": "uint256"}
            ],
            "name": "getReply",
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
                "internalType": "struct ChatFeed.Message",
                "name": "",
                "type": "tuple"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ]);

        const contract = new ethers.Contract(this.getChatContext, intrfc, provider);

        let msg;
        let replyObj;

        msg = await contract.getMainMessage(this.getMessageId);
        
        if (this.isReply) {
          replyObj = await contract.getReply(this.getMessageId, this.getReplyId);
        }

        if (!msg.deleted) {
          this.message = {
            author: msg.author,
            url: msg.url,
            createdAt: msg.createdAt.toNumber(),
            deleted: msg.deleted,
            repliesCount: msg.repliesCount.toNumber(),
            index: msg.index.toNumber(),
          };
        } else {
          this.toast('This message has been deleted.', { type: 'info' });
        }

        if (replyObj) {
          if (!replyObj.deleted) {
            this.reply = {
              author: replyObj.author,
              url: replyObj.url,
              createdAt: replyObj.createdAt.toNumber(),
              deleted: replyObj.deleted,
              repliesCount: replyObj.repliesCount.toNumber(),
              index: replyObj.index.toNumber(),
            };
          } else {
            this.toast('This reply has been deleted.', { type: 'info' });
          }
        }

      } catch (error) {
        console.error(error);
        this.toast('Failed to load the message', { type: 'error' });
      }
    }
  },

  setup() {
    const route = useRoute()
    const toast = useToast()

    return {
      route,
      toast,
    }
  },

  watch: {
    getChatContext(val, oldVal) {
      // TODO: refresh post object if id in query has changed
      this.getMessage()
    },

    getMessageId(val, oldVal) {
      // TODO: refresh post object if id in query has changed
      this.getMessage()
    },

    getReplyId(val, oldVal) {
      // TODO: refresh post object if id in query has changed
      this.getMessage()
    },
  },
}
</script>
