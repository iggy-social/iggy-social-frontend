import{H as g,M as d}from"./components.65493ec7.js";import{a as C,S as b,x as y,b as P,e as s,w as x,c,m as p,r as m,o as i}from"./entry.894026b0.js";import{C as _}from"./ChatPost.193c556b.js";import{C as O}from"./ChatFeed.bfcb3a81.js";import"./composables.b5f8292d.js";import"./user.a4b9c39c.js";import"./domainUtils.7f59e719.js";import"./MintedPostImage.5f279683.js";import"./WaitingToast.94fb30ff.js";import"./textUtils.04c6a108.js";import"./storageUtils.fdd1c911.js";import"./site.d9ccf281.js";import"./ConnectWalletButton.503fc574.js";import"./FileUploadModal.cc2af261.js";const k={data(){return{hasMaster:!1,masterPost:null,post:null,replyNotMaster:!1}},components:{ChatFeed:O,ChatPost:_},created(){this.getPostObject()},computed:{getOrbisContext(){return this.post?.context?this.post.context:this.post?.content.context?this.post.content.context:this.post?.context_details.context_id?this.post.context_details.context_id:this.$config.orbisTest?this.$config.orbisTestContext:this.$config.chatChannels.general},getPostAuthor(){return this.post?this.post.creator_details.metadata.address:null},getQueryId(){return this.route.query.id}},methods:{async getPostObject(){this.post=null,this.masterPost=null,this.hasMaster=!1,this.replyNotMaster=!1;let{data:t,error:o}=await this.$orbis.getPost(this.route.query.id);if(this.post=t,o)console.log("Orbis error"),console.log(o),this.toast("Orbis error",{type:"error"}),this.toast(o,{type:"error"});else if(this.post.master){this.hasMaster=!0,this.post.master!==this.post.reply_to&&(this.replyNotMaster=!0);let{data:l,error:n}=await this.$orbis.getPost(this.post.master);this.masterPost=l,n&&(console.log("Orbis error"),console.log(n),this.toast("Orbis error",{type:"error"}),this.toast(n,{type:"error"}))}}},setup(){const t=b(),o=y();return{route:t,toast:o}},watch:{getQueryId(t,o){this.getPostObject()}}};function w(t,o,l,n,e,a){const r=d,u=g,h=m("ChatPost"),f=m("ChatFeed");return i(),P("div",null,[s(u,null,{default:x(()=>[s(r,{name:"description",content:"Check out this chat post on "+t.$config.projectName+"!"},null,8,["content"]),s(r,{property:"og:image",content:t.$config.projectUrl+t.$config.previewImagePost},null,8,["content"]),s(r,{property:"og:description",content:"Check out this chat post on "+t.$config.projectName+"!"},null,8,["content"]),s(r,{name:"twitter:image",content:t.$config.projectUrl+t.$config.previewImagePost},null,8,["content"]),s(r,{name:"twitter:description",content:"Check out this chat post on "+t.$config.projectName+"!"},null,8,["content"])]),_:1}),e.masterPost?(i(),c(h,{key:0,class:"m-4",post:e.masterPost,orbisContext:a.getOrbisContext},null,8,["post","orbisContext"])):p("",!0),e.post?(i(),c(h,{key:1,post:e.post,orbisContext:a.getOrbisContext},null,8,["post","orbisContext"])):p("",!0),e.post?(i(),c(f,{key:2,id:e.post.stream_id,master:e.post.master,masterPost:e.post,orbisContext:a.getOrbisContext},null,8,["id","master","masterPost","orbisContext"])):p("",!0)])}const A=C(k,[["render",w]]);export{A as default};