<template>
<span @click="fetchMintData" class="cursor-pointer ms-3" data-bs-toggle="modal" :data-bs-target="'#mintPostModal'+post.stream_id">
  <i class="bi bi-collection"></i> 
  Mint
</span>

<!-- Mint Post Modal -->
<div class="modal fade" :id="'mintPostModal'+post.stream_id" tabindex="-1" aria-labelledby="mintPostModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="mintPostModalLabel">Mint this post as NFT</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Mint this post as NFT and show appreciation to the author.</p>

        <p>
          Minting price: {{ postPrice }} {{ $config.tokenSymbol }}
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="mintPost" :disabled="!isActivated">
          Mint post for {{ postPrice }} {{ $config.tokenSymbol }}
        </button>
      </div>
    </div>
  </div>
</div>
<!-- END Mint Post Modal -->
</template>

<script>
import { useEthers } from 'vue-dapp';
import { ethers } from 'ethers';
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import sanitizeHtml from 'sanitize-html';

export default {
  name: "IggyPostMint",
  props: ["post", "parsedText"],

  data() {
    return {
      postPrice: null,
      textPreview: null
    }
  },

  created() {
    this.createTextPreview();
  },

  methods: {
    createTextPreview() {
      const sanitizedText = sanitizeHtml(this.parsedText, {
        allowedTags: [],
        allowedAttributes: {}
      });

      if (sanitizedText.length > 100) {
        this.textPreview = sanitizedText.replace(/[^\x00-\x7F]/g, "").substring(0, 97) + "...";
      } else if (sanitizedText.length === 0) {
        this.textPreview = "No text";
      } else {
        this.textPreview = sanitizedText.replace(/[^\x00-\x7F]/g, "");
      }
    },

    async fetchMintData() {
      console.log("fetchMintData");

      if (this.isActivated) {
        const iggyPostInterface = new ethers.utils.Interface([
          "function getPostPrice(string memory _postId, address _author) external view returns (uint256)"
        ]);

        const iggyContract = new ethers.Contract(this.$config.iggyPostAddress, iggyPostInterface, this.signer);

        const postPriceWei = await iggyContract.getPostPrice(this.post.stream_id, this.post.creator_details.metadata.address);

        this.postPrice = ethers.utils.formatUnits(postPriceWei, this.$config.tokenDecimals);
      }
    },

    async mintPost() {
      if (this.isActivated) {
        const iggyPostMinterInterface = new ethers.utils.Interface([
          "function mint(string memory _postId, address _author, address _nftReceiver, address _referrer, string memory _textPreview, uint256 _quantity) external payable returns(uint256 tokenId)"
        ]);

        const iggyMinterContract = new ethers.Contract(this.$config.iggyPostMinterAddress, iggyPostMinterInterface, this.signer);

        // mint post
        try {
          const tx = await iggyMinterContract.mint(
            this.post.stream_id, // post ID
            this.post.creator_details.metadata.address, // post author
            this.address, // NFT receiver
            ethers.constants.AddressZero, // @todo: enable referrals
            String(this.textPreview), // text preview
            1, // quantity
            {
              value: ethers.utils.parseUnits(this.postPrice, this.$config.tokenDecimals)
            }
          );

          document.getElementById('mintPostModal'+this.post.stream_id).click();

          const toastWait = this.toast(
            {
              component: WaitingToast,
              props: {
                text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
              }
            },
            {
              type: "info",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            }
          );

          const receipt = await tx.wait();

          if (receipt.status === 1) {
            this.toast.dismiss(toastWait);
            this.toast("You have successfully minted this post as NFT!", {
              type: "success",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
          } else {
            this.toast.dismiss(toastWait);
            this.toast("Transaction has failed.", {
              type: "error",
              onClick: () => window.open(this.$config.blockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            console.log(receipt);
          }

        } catch (e) {
          console.log(e);
          this.toast(e.message, {type: "error"});
        }
      }
    }
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();

    return {
      address, isActivated, signer, toast
    }
  }
}
</script>