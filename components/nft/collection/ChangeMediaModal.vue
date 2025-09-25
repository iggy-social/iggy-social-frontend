<template>
  <div class="modal fade" id="changeMediaModal" tabindex="-1" :aria-labelledby="'modalLabel-'+componentId" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" :id="'modalLabel-'+componentId">Change media metadata</h1>
          <button :id="'closeModal-'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>Change media metadata for your NFT.</p>
          <p>You will need to upload these files somewhere first, we recommend 
            <a target="_blank" href="https://ardrive.io/">ArDrive</a>.
          </p>

          <div class="mt-4">
            <div class="mb-2">
              <label :for="'input-audio-'+componentId" class="form-label">
                <strong>
                  Set a new audio URL or CID for your NFT:
                </strong>
              </label>

              <input v-model="audioUrl" placeholder="Enter audio URL/CID here" type="text" class="form-control" :id="'input-audio-'+componentId">
            </div>

            <div class="d-flex justify-content-between">
              <button @click="setAudio" :disabled="waitingAudio" class="btn btn-primary">
                <span v-if="waitingAudio" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submit audio URL or CID
              </button>

              <button @click="removeAudio" :disabled="waitingAudio" class="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-2">
              <label :for="'input-video-'+componentId" class="form-label">
                <strong>
                  Set a new video URL or CID for your NFT:
                </strong>
              </label>

              <input v-model="videoUrl" placeholder="Enter video URL/CID here" type="text" class="form-control" :id="'input-video-'+componentId">
            </div>

            <div class="d-flex justify-content-between">
              <button @click="setVideo" :disabled="waitingVideo" class="btn btn-primary">
                <span v-if="waitingVideo" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submit video URL or CID
              </button>

              <button @click="removeVideo" :disabled="waitingVideo" class="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-2">
              <label :for="'input-youtube-'+componentId" class="form-label">
                <strong>
                  Set a new YouTube video URL for your NFT:
                </strong>
              </label>

              <input v-model="youtubeUrl" placeholder="Enter YouTube URL here" type="text" class="form-control" :id="'input-youtube-'+componentId">
            </div>

            <div class="d-flex justify-content-between">
              <button @click="setYoutube" :disabled="waitingYoutube" class="btn btn-primary">
                <span v-if="waitingYoutube" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Submit YouTube URL
              </button>

              <button @click="removeYoutube" :disabled="waitingYoutube" class="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "@/components/WaitingToast";
import { writeData } from '@/utils/contractUtils'
import { waitForTxReceipt } from '@/utils/txUtils'

export default {
  name: 'ChangeMediaModal',
  props: ["cAddress", "mdAddress"],

  data() {
    return {
      componentId: null,
      audioUrl: null,
      videoUrl: null,
      youtubeUrl: null,
      waitingAudio: false,
      waitingVideo: false,
      waitingYoutube: false,
    }
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async removeAudio() {
      this.audioUrl = "";
      await this.setAudio();
    },

    async removeVideo() {
      this.videoUrl = "";
      await this.setVideo();
    },

    async removeYoutube() {
      this.youtubeUrl = "";
      await this.setYoutube();
    },

    sanitizeUrl(url) {
      if (!url) {
        return "";
      }

      if (url) {
        url = url.trim();
      }

      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("ipfs://") && !url.startsWith("ar://")) {
        if (!url.includes("/") && !url.includes(".")) {
          return "ipfs://" + url;
        } else if (url.split(".").length > 2) {
          return "https://" + url;
        }

        return "ipfs://" + url;
      }

      return url;
    },

    async setAudio() {
      this.waitingAudio = true;
      this.audioUrl = this.sanitizeUrl(this.audioUrl);
      
      try {
        const hash = await writeData({
          address: this.mdAddress,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "nftAddress_",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "audioUrl_",
                  "type": "string"
                }
              ],
              "name": "setAudioUrl",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          functionName: 'setAudioUrl',
          args: [this.cAddress, this.audioUrl]
        });

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          }
        );

        const receipt = await waitForTxReceipt(hash);

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully set a new audio URL/CID.", {
            type: "success",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });

          this.audioUrl = null;
          this.waitingAudio = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingAudio = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingAudio = false;
      }
    },

    async setVideo() {
      this.waitingVideo = true;
      this.videoUrl = this.sanitizeUrl(this.videoUrl);

      try {
        const hash = await writeData({
          address: this.mdAddress,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "nftAddress_",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "animationUrl_",
                  "type": "string"
                }
              ],
              "name": "setAnimationUrl",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          functionName: 'setAnimationUrl',
          args: [this.cAddress, this.videoUrl]
        });

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          }
        );

        const receipt = await waitForTxReceipt(hash);

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully set a new video URL/CID.", {
            type: "success",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });

          this.videoUrl = null;
          this.waitingVideo = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingVideo = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingVideo = false;
      }
    },

    async setYoutube() {
      this.waitingYoutube = true;

      if (!this.youtubeUrl) {
        this.youtubeUrl = "";
      }

      try {
        const hash = await writeData({
          address: this.mdAddress,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "nftAddress_",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "youtubeUrl_",
                  "type": "string"
                }
              ],
              "name": "setYoutubeUrl",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          functionName: 'setYoutubeUrl',
          args: [this.cAddress, this.youtubeUrl]
        });

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: "info",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          }
        );

        const receipt = await waitForTxReceipt(hash);

        if (receipt.status === 'success') {
          this.toast.dismiss(toastWait);

          this.toast("You have successfully set a new YouTube URL.", {
            type: "success",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });

          this.youtubeUrl = null;
          this.waitingYoutube = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingYoutube = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () => window.open(this.$config.public.blockExplorerBaseUrl+"/tx/"+hash, '_blank').focus()
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split('Details:')[1]
          extractMessage = extractMessage.split('Version: viem')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage);
          
          this.toast(extractMessage, {type: "error"});
        } catch (e) {
          this.toast("Transaction has failed.", {type: "error"});
        }

        this.waitingYoutube = false;
      }
    },
  },

  setup() {
    const toast = useToast();

    return { 
      toast 
    };
  },
}
</script>
