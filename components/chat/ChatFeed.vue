<template>
  <div class="scroll-500">

    <!-- Categories / Tags Big Button -->
    <div v-if="!id && !allPosts" class="d-grid gap-2 mb-2">
      <div class="btn-group dropdown-center">
        <button class="btn btn-primary btn-block dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{ getSelectedTagObject.title }}
        </button>
        <ul class="dropdown-menu">
          <span 
            v-for="(tagObject, index) in filteredCategories"
            :key="tagObject.slug"
            class="dropdown-item cursor-pointer"
            @click="changeTag(index)"
          >{{ tagObject.title }}</span>
        </ul>
      </div>
    </div>

    <!-- Post/Comment Input Box -->
    <div class="card mb-2 border" v-if="!hideCommentBox">
      <div class="card-body">
        <div class="form-group mt-2 mb-2">
          <textarea 
            v-model="postText" 
            :disabled="!userStore.getIsConnectedToOrbis || !isSupportedChain || !hasDomainOrNotRequired" 
            class="form-control" id="exampleTextarea" rows="5" 
            :placeholder="createPostPlaceholder"
          ></textarea>
        </div>

        <div class="d-flex justify-content-between">
          <div>
            <!-- GIF button -->
            <TenorGifSearch 
              v-if="$config.tenorApiKey != '' && isActivated && userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired"  
              @insertGif="insertImage"
            />

            <!-- Sticker button 
            <TenorStickerSearch 
              v-if="$config.tenorApiKey != '' && isActivated && userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired"  
              @insertSticker="insertImage"
            />
            -->

            <!-- Upload IMG button -->
            <button 
              v-if="isActivated && $config.fileUploadEnabled !== '' && userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired"
              class="btn btn-outline-primary me-2 mt-2 btn-sm" 
              data-bs-toggle="modal" :data-bs-target="'#fileUploadModal'+$.uid"
            >
              <i class="bi bi-file-earmark-image-fill"></i>
              IMG
            </button>

            <!-- Upload Image Modal -->
            <FileUploadModal 
              v-if="userStore.getIsConnectedToOrbis"
              @processFileUrl="insertImage"
              title="Upload image"
              infoText="Upload an image."
              :componentId="$.uid"
              :maxFileSize="$config.fileUploadSizeLimit"
            />
            <!-- END Upload Image Modal -->

            <!-- Emoji Picker -->
            <EmojiPicker  
              v-if="isActivated && userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired"
              @updateEmoji="insertEmoji"
            />
          </div>
          
          <div>
            <!-- Create Post button -->
            <button 
              v-if="isActivated && userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired" 
              :disabled="!postText || waitingCreatePost" 
              class="btn btn-primary me-2 mt-2" 
              @click="createPost"
            >Submit</button>

            <!-- Sign Into Chat button -->
            <button 
              v-if="isActivated && !userStore.getIsConnectedToOrbis && isSupportedChain && hasDomainOrNotRequired" 
              class="btn btn-primary" @click="connectToOrbis"
            >Sign into chat</button>

            <!-- Get Username button -->
            <button 
              v-if="isActivated && isSupportedChain && !hasDomainOrNotRequired" 
              class="btn btn-primary disabled"
            >Get yourself a {{ $config.tldName }} name to post <i class="bi bi-arrow-right"></i></button>
            
            <!-- Connect Wallet button -->
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />

            <!-- Switch Chain button -->
            <SwitchChainButton v-if="isActivated && !isSupportedChain" :navbar="false" :dropdown="false" />
          </div>
        
        </div>
      </div>
    </div>

    <!-- Categories / Tags Small Button -->
    <!--
    <div v-if="!id" class="d-flex justify-content-end mb-2">
      <div class="btn-group">
        <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{ getSelectedTagObject.title }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <span 
            v-for="(tagObject, index) in filteredCategories"
            :key="tagObject.slug"
            class="dropdown-item cursor-pointer"
            @click="changeTag(index)"
          >{{ tagObject.title }}</span>
        </ul>
      </div>
    </div>
    -->

    <div v-if="orbisPosts">
      <ChatPost 
        @insertReply="insertReply" 
        @removePost="removePost" 
        v-for="post in orbisPosts" 
        :key="post.stream_id"
        :showQuotedPost="showQuotedPost" 
        :post="post"
        :orbisContext="getOrbisContext" />
    </div>

    <div class="d-flex justify-content-center mt-5 mb-4" v-if="orbisPosts.length === 0 && !waitingLoadPosts">
      <p>No posts yet. Be the first to post!</p>
    </div>

    <div class="d-flex justify-content-center mb-3" v-if="waitingLoadPosts">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>
    
    <div class="d-grid gap-2 col-6 mx-auto mb-5" v-if="showLoadMore">
      <button class="btn btn-primary" type="button" @click="getOrbisPosts">Load more posts</button>
    </div>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import ChatPost from "~/components/chat/ChatPost.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useChatStore } from '~/store/chat';
import { useSiteStore } from '~/store/site';
import { useUserStore } from '~/store/user';
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import SwitchChainButton from "~/components/SwitchChainButton.vue";
import TenorGifSearch from "~/components/tenor/TenorGifSearch.vue";
import TenorStickerSearch from "~/components/tenor/TenorStickerSearch.vue";
import FileUploadModal from "~/components/storage/FileUploadModal.vue";

import EmojiPicker from '~/components/EmojiPicker.vue'
import 'emoji-mart-vue-fast/css/emoji-mart.css'

export default {
  name: "ChatFeed",
  props: [
    "allPosts", // show all posts (all tags/categories)
    "byDid", // if looking for posts by a specific user (user's DID)
    "hideCommentBox", // if true, we'll hide the comment box
    "id", // id (optional) is the post id that this component looks for replies to
    "master", // master stream ID, if there's a master post, we'll show it at the top
    "masterPost", // master post object (if it exists)
    "orbisContext",
    "showQuotedPost" // if true, we'll show the quoted posts (for any post that has a quote)
  ],

  components: {
    ChatPost,
    ConnectWalletButton,
    FileUploadModal,
    SwitchChainButton,
    TenorGifSearch,
    TenorStickerSearch,
    EmojiPicker
  },

  data() {
    return {
      orbisPosts: [],
      pageCounter: 0,
      postText: null,
      reply_to: null, 
      showLoadMore: true,
      waitingCreatePost: false,
      waitingLoadPosts: false
    }
  },

  created() {
    this.checkConnectionToOrbis();
    this.getOrbisPosts();
  },

  computed: {
    createPostPlaceholder() {
      if (this.userStore.getIsConnectedToOrbis) {
        if (this.id) {
          return "Post your reply"
        }
        return "What's happening?"
      } else if (!this.isActivated) {
        return "What's happening? (Please connect wallet and then sign into chat to post messages.)"
      } else {
        return "What's happening? (Please sign into chat to post messages.)"
      }
    },

    filteredCategories() {
      let cats = [];
      
      for (let i = 0; i < this.$config.orbisCategories.length; i++) {
        // exclude categories that are marked as hidden
        if (this.$config.orbisCategories[i].hidden === false) {
          cats.push({
            slug: this.$config.orbisCategories[i].slug,
            title: this.$config.orbisCategories[i].title
          });
        }
      }

      return cats;
    },

    getOrbisContext() {
      return this.orbisContext;
    },

    getSelectedTagObject() {
      if (this.chatStore.getSelectedTagIndex > 0 && this.chatStore.getSelectedTagIndex < this.filteredCategories.length) {
        return this.filteredCategories[this.chatStore.getSelectedTagIndex];
      } else {
        return this.filteredCategories[0];
      }
    },

    getTagFromChatStore() {
      return this.chatStore.getSelectedTagIndex;
    },

    hasDomainOrNotRequired() {
      if (this.$config.domainRequiredToPost) {
        if (this.userStore.getDefaultDomain) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true;
      } else {
        return false;
      }
    },

    showOnlyMasterPosts() {
      // check if user chose to only show master posts on the main feed in local storage
      if (this.siteStore.getShowOnlyMasterPosts === 'true') {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {
    insertEmoji(emoji) {
      if (!this.postText) {
        this.postText = emoji;
      } else {
        this.postText += emoji;
      }
    },

    changeTag(index) {
      this.chatStore.setSelectedTagIndex(index);
    },

    async checkConnectionToOrbis() {
      const isConn = await this.$orbis.isConnected();
      this.userStore.setIsConnectedToOrbis(isConn);

      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },

    async connectToOrbis() {
      let res = await this.$orbis.connect_v2({
        provider: this.signer.provider.provider, 
        lit: false
      });

      /** Check if connection is successful or not */
      if(res.status == 200) {
        this.userStore.setIsConnectedToOrbis(true);

        if (this.$orbis.session) {
          this.userStore.setDid(this.$orbis.session.did._id);
          this.userStore.setDidParent(this.$orbis.session.did._parentId);
        }
      } else {
        console.log("Error connecting to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
      }
    },

    async createPost() {
      this.waitingCreatePost = true;

      let options;

      if (this.id) {
        let masterId;

        if (this.master) {
          masterId = this.master;
        } else {
          masterId = this.id;
        }

        options = {
          master: masterId, // the main post in the thread
          reply_to: this.id, // important: reply_to needs to be filled out even if the reply is directly to the master post
          body: this.postText, 
          context: this.getOrbisContext
        }

        // if post has tags, add them to the options
        if (this.masterPost?.content?.tags) {
          options["tags"] = this.masterPost.content.tags;
        } else {
          options["tags"] = [{ "slug": "general", "title": "General discussion" }]; // default to "General" tag
        }

      } else {
        options = {
          body: this.postText, 
          context: this.getOrbisContext
        }

        // add tags
        if (this.chatStore.getSelectedTagIndex > 0 && this.chatStore.getSelectedTagIndex < this.filteredCategories.length) {
          options["tags"] = [this.filteredCategories[this.chatStore.getSelectedTagIndex]];
        } else {
          this.changeTag(0); // change tag selection to 0 (tag may be out of bounds)
          options["tags"] = [{ "slug": "general", "title": "General discussion" }]; // default to "General" tag
        }
      }

      // post on Orbis & Ceramic
      let res = await this.$orbis.createPost(options);

      /** Check if posting is successful or not */
      if(res.status == 200) {
        // post on current feed
        this.orbisPosts.unshift({
          stream_id: res.doc,
          count_likes: 0,
          timestamp: Math.floor(Date.now() / 1000),
          creator_details: {
            metadata: {
              address: this.address
            },
            profile: {
              pfp: this.userStore.getOrbisImage
            }
          },
          master: this.id,
          reply_to: this.id,
          content: {
            body: this.postText
          }
        });

        this.postText = null;
        this.waitingCreatePost = false;
      } else {
        console.log("Error posting via Orbis to Ceramic: ", res);
        this.toast(res.result, {type: "error"});
        this.waitingCreatePost = false;
      }
    },

    async getOrbisPosts() {
      this.waitingLoadPosts = true;

      let ascending = false; // sort by descending order (from newest to oldest) by default
      let options;

      if (this.id) {
        // Post details page
        ascending = true; // if this is a post details page, sort replies by ascending order (from oldest to newest)

        options = {
          master: this.id, // master is the post ID
          context: this.getOrbisContext, // context is the group ID
          tag: this.masterPost.content.tags[0].slug, // tag is the tag of the master post
          only_master: false // only get master posts (not replies), or all posts
        }
      } else {
        // Main feed
        options = {
          //algorithm: "recommendations", // recommendations, all-posts, all-posts-non-filtered
          context: this.getOrbisContext, // context is the group ID
          only_master: this.showOnlyMasterPosts // only get master posts (not replies), or all posts
        }

        // search by tag/category (except on the Profile page where comment box is hidden)
        if (!this.allPosts) {

          if (this.chatStore.getSelectedTagIndex > 0 && this.chatStore.getSelectedTagIndex < this.filteredCategories.length) {
            options["tag"] = this.filteredCategories[this.chatStore.getSelectedTagIndex].slug;
          } else {
            this.changeTag(0);

            if (this.filteredCategories[0].slug !== "all") {
              options["tag"] = this.filteredCategories[0].slug;
            }
          }
        }
      }

      if (this.byDid) {
        options["did"] = this.byDid;
        options["only_master"] = false;
      }

      let { data, error } = await this.$orbis.getPosts(
        options,
        this.pageCounter,
        this.$config.getPostsLimit,
        ascending
      );

      if (error) {
        this.toast("Error fetching posts from the Orbis/Ceramic node.", {type: "error"});
        console.log(error);
        //this.toast(error, {type: "error"});
      }

      //console.log("data:");
      //console.log(data);

      if (data.length < this.$config.getPostsLimit) {
        this.showLoadMore = false; // hide Load More Posts button if there's less than getPostsLimit number of posts received
      } else if (data.length === this.$config.getPostsLimit) {
        this.showLoadMore = true; // show Load More Posts button if data length was full (getPostsLimit number of posts)
      }

      this.orbisPosts.push(...data);

      this.pageCounter++;

      this.waitingLoadPosts = false;
    },

    async insertImage(imageUrl) {
      // add image url to postText
      if (!this.postText) {
        this.postText = imageUrl + " ";
      } else {
        this.postText = this.postText + " " + imageUrl + " ";
      }
    },

    async insertReply(streamId, replyToId, replyText, repliedText, repliedAddress) {
      // callback hook for ChatPost component
      // listens for reply event and inserts reply into feed
      this.orbisPosts.unshift({
        stream_id: streamId,
        count_likes: 0,
        timestamp: Math.floor(Date.now() / 1000),
        creator_details: {
          metadata: {
            address: this.address
          },
          profile: {
            pfp: this.userStore.getOrbisImage
          }
        },
        master: this.id,
        reply_to: replyToId, // the post/stream ID of the post being replied to
        content: {
          body: replyText // the text of the reply
        },
        reply_to_details: {
          body: repliedText // the text of the post being replied to
        },
        reply_to_creator_details: {
          metadata: {
            address: repliedAddress // the author address of the post being replied to
          }
        }
      });
    },

    async removePost(streamId) {
      // callback hook for ChatPost component
      // listens for delete event and removes post from feed
      this.orbisPosts = this.orbisPosts.filter((p) => p.stream_id !== streamId);
    }
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const chatStore = useChatStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();

    return { address, chainId, isActivated, signer, toast, chatStore, siteStore, userStore }
  },

  watch: {
    getTagFromChatStore() {
      // reset posts and page counter
      this.orbisPosts = [];
      this.pageCounter = 0;

      // fetch posts
      this.getOrbisPosts();
    }
  }
}
</script>
