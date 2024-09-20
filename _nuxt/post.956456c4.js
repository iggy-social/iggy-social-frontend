import{H as M,M as f}from"./components.89401fa0.js";import{a as x,al as I,ae as T,b as m,f as _,e as r,w as d,c as l,l as p,F as b,r as g,am as N,o,i as k}from"./entry.5680e7ab.js";import{C as w,a as v}from"./ChatFeed.8d057257.js";import{I as R,C as F}from"./ethers.391428e7.js";import"./composables.e3f6b801.js";import"./textUtils.b5c678fc.js";import"./Image.53750f45.js";import"./site.cb3cd003.js";import"./balanceUtils.5f489592.js";import"./user.da52f26c.js";import"./SwitchChainButton.dce7a788.js";import"./WaitingToast.327ff00b.js";import"./domainUtils.b0598e01.js";import"./storageUtils.6b1d1d0c.js";import"./FileUploadModal.a0054a7d.js";import"./FileUploadInput.b97760b9.js";const V={data(){return{message:null,reply:null}},components:{ChatFeed:w,ChatMessage:v},created(){this.getMessage()},computed:{getChatContext(){return this.route.query.context},getMessageId(){return this.route.query.id},getReplyId(){return this.route.query.reply},isReply(){return!!this.route.query.reply},mainMessagePage(){return`/post/?id=${this.getMessageId}&context=${this.getChatContext}`}},methods:{async getMessage(){this.message=null,this.reply=null;try{const e=this.$getFallbackProvider(this.$config.supportedChainId),s=new R([{inputs:[{internalType:"uint256",name:"mainMsgIndex_",type:"uint256"}],name:"getMainMessage",outputs:[{components:[{internalType:"address",name:"author",type:"address"},{internalType:"uint256",name:"createdAt",type:"uint256"},{internalType:"bool",name:"deleted",type:"bool"},{internalType:"uint256",name:"index",type:"uint256"},{internalType:"uint256",name:"repliesCount",type:"uint256"},{internalType:"string",name:"url",type:"string"}],internalType:"struct ChatFeed.Message",name:"",type:"tuple"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint256",name:"mainMsgIndex_",type:"uint256"},{internalType:"uint256",name:"replyMsgIndex_",type:"uint256"}],name:"getReply",outputs:[{components:[{internalType:"address",name:"author",type:"address"},{internalType:"uint256",name:"createdAt",type:"uint256"},{internalType:"bool",name:"deleted",type:"bool"},{internalType:"uint256",name:"index",type:"uint256"},{internalType:"uint256",name:"repliesCount",type:"uint256"},{internalType:"string",name:"url",type:"string"}],internalType:"struct ChatFeed.Message",name:"",type:"tuple"}],stateMutability:"view",type:"function"}]),u=new F(this.getChatContext,s,e);let n,t;n=await u.getMainMessage(this.getMessageId),this.isReply&&(t=await u.getReply(this.getMessageId,this.getReplyId)),n.deleted?this.toast("This message has been deleted.",{type:"info"}):this.message={author:n.author,url:n.url,createdAt:n.createdAt.toNumber(),deleted:n.deleted,repliesCount:n.repliesCount.toNumber(),index:n.index.toNumber()},t&&(t.deleted?this.toast("This reply has been deleted.",{type:"info"}):this.reply={author:t.author,url:t.url,createdAt:t.createdAt.toNumber(),deleted:t.deleted,repliesCount:t.repliesCount.toNumber(),index:t.index.toNumber()})}catch(e){console.error(e),this.toast("Failed to load the message",{type:"error"})}}},setup(){const e=I(),s=T();return{route:e,toast:s}},watch:{getChatContext(e,s){this.getMessage()},getMessageId(e,s){this.getMessage()},getReplyId(e,s){this.getMessage()}}};function j(e,s,u,n,t,a){const i=f,y=M,c=g("ChatMessage"),h=g("ChatFeed"),C=N;return o(),m(b,null,[_("div",null,[r(y,null,{default:d(()=>[r(i,{name:"description",content:"Check out this chat post on "+e.$config.projectName+"!"},null,8,["content"]),r(i,{property:"og:image",content:e.$config.projectUrl+e.$config.previewImagePost},null,8,["content"]),r(i,{property:"og:description",content:"Check out this chat post on "+e.$config.projectName+"!"},null,8,["content"]),r(i,{name:"twitter:image",content:e.$config.projectUrl+e.$config.previewImagePost},null,8,["content"]),r(i,{name:"twitter:description",content:"Check out this chat post on "+e.$config.projectName+"!"},null,8,["content"])]),_:1})]),(o(),m("div",{key:t.message?.url},[t.message?(o(),l(c,{key:0,message:t.message,chatContext:a.getChatContext},null,8,["message","chatContext"])):p("",!0),t.reply?(o(),l(c,{key:1,message:t.reply,mainMessageIndex:a.getMessageId,chatContext:a.getChatContext},null,8,["message","mainMessageIndex","chatContext"])):p("",!0),a.isReply?p("",!0):(o(),l(h,{key:2,chatContext:a.getChatContext,mainMessageIndex:a.getMessageId},null,8,["chatContext","mainMessageIndex"])),a.isReply?(o(),l(C,{key:3,to:a.mainMessagePage,class:"btn btn-primary"},{default:d(()=>[k("See other replies")]),_:1},8,["to"])):p("",!0)]))],64)}const Q=x(V,[["render",j]]);export{Q as default};
