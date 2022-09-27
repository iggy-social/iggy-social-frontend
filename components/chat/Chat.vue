<template>
  <div class="main">
    <div class="px-2 scroll">

        <div class="d-flex align-items-center" v-for="post in orbisPosts" :key="post">
            <div class="text-left pr-1">
              <img v-if="post.creator_details.profile" :src="post.creator_details.profile.pfp" width="30" class="img1" />
              <img v-if="!post.creator_details.profile" src="https://img.icons8.com/color/40/000000/guest-female.png" width="30" class="img1" />
            </div>

            <div class="pr-2 pl-1"> 
              <span v-if="post.creator_details.metadata" class="name">{{post.creator_details.metadata.address}}</span>
              <span v-if="!post.creator_details.metadata" class="name">Anon</span>
              <p class="msg">{{post.content.body}}</p>
            </div>
        </div>

        <!--
        <div class="d-flex align-items-center text-right justify-content-end ">
            <div class="pr-2"> <span class="name">Dr. Hendrikson</span>
                <p class="msg">Let's jump on a video call</p>
            </div>
            <div><img src="https://i.imgur.com/HpF4BFG.jpg" width="30" class="img1" /></div>
        </div>
        -->
    </div>
    <nav class="navbar bg-white navbar-expand-sm d-flex justify-content-between"> 
      <input type="text number" name="text" class="form-control" placeholder="Type a message...">
        
      <div class="icondiv d-flex justify-content-end align-content-center text-center ml-2"> 
        <i class="fa fa-paperclip icon1"></i> 
        <i class="fa fa-arrow-circle-right icon2"></i> 
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "Chat",

  data() {
    return {
      orbisPosts: null,
    }
  },

  created() {
    this.getOrbisPosts();
  },

  methods: {
    async getOrbisPosts() {
      let { data, error, status } = await this.$orbis.getPosts({context: "kjzl6cwe1jw14ai2gg8e0qmx2j944ppe3s3dgfk003jlb8guuybyg4m77nsrg73"});

      console.log("status:");
      console.log(status);
      console.log("error:");
      console.log(error);
      console.log("data:");
      console.log(data);

      this.orbisPosts = data;
    },
  },

  setup() {
    
  },
}
</script>

<style scoped>
::-webkit-scrollbar {
    width: 10px
}

::-webkit-scrollbar-track {
    background: #eee
}

::-webkit-scrollbar-thumb {
    background: #888
}

::-webkit-scrollbar-thumb:hover {
    background: #555
}

.main {
    background-color: #eee;
    width: 100%;
    position: relative;
    border-radius: 8px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    padding: 6px 0px 0px 0px
}

.scroll {
    overflow-y: scroll;
    scroll-behavior: smooth;
    height: 325px
}

.img1 {
    border-radius: 50%;
    background-color: #66BB6A
}

.name {
    font-size: 8px;
    color: #3e3c3c;
}

.msg {
    background-color: #fff;
    font-size: 11px;
    padding: 5px;
    border-radius: 5px;
    font-weight: 500;
    color: #3e3c3c
}

.between {
    font-size: 8px;
    font-weight: 500;
    color: #a09e9e
}

.navbar {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)
}

.form-control {
    font-size: 12px;
    font-weight: 400;
    width: 100%; /*230px;*/
    height: 30px;
    border: none
}

.form-control:focus {
    box-shadow: none;
    overflow: hidden;
    border: none
}

.form-control:focus {
    box-shadow: none !important
}

.icon1 {
    color: #7C4DFF !important;
    font-size: 18px !important;
    cursor: pointer
}

.icon2 {
    color: #512DA8 !important;
    font-size: 18px !important;
    position: relative;
    left: 8px;
    padding: 0px;
    cursor: pointer
}

.icondiv {
    border-radius: 50%;
    width: 15px;
    height: 15px;
    padding: 2px;
    position: relative;
    bottom: 1px
}
</style>