import{H as I,T as w,M as k}from"./components.e4131225.js";import{a as N,I as C,G as P,a9 as v,K as T,b as p,e as r,w as y,f as e,l as m,t as h,i as l,c as $,r as B,o as d}from"./entry.c086bcfc.js";import{C as U}from"./ChatPost.89b65bfe.js";import{u as j}from"./ethers.ef37d6da.js";import"./composables.c1317a93.js";import"./user.e18caf12.js";import"./Image.98a77cf8.js";import"./ipfsUtils.1cb2baa1.js";import"./domainUtils.9283c6f4.js";import"./SwitchChainButton.d91125d7.js";import"./WaitingToast.c5f18c30.js";import"./textUtils.4b923abd.js";import"./storageUtils.dde23a19.js";import"./MintedPostImage.aa7c93b2.js";const O={data(){return{created:null,currentUserBalance:null,image:null,post:null}},components:{ChatPost:U},mounted(){this.getPostObject()},computed:{getOrbisContext(){return this.$config.orbisTest?this.$config.orbisTestContext:this.$config.chatChannels.general},getPostAuthor(){return this.post?this.post.creator_details.metadata.address:null},getQueryId(){return this.route.query.id}},methods:{async getPostObject(){this.post=null;const t=this.route.query.id;let s=localStorage.getItem("minted-post-"+t),a=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(a=this.signer);const u=new C(["function balanceOf(address _owner, uint256 _tokenId) external view returns (uint256)","function doesPostExist(string memory _postId, address _authorId) external view returns (bool)","function uri(uint256 _tokenId) public view returns (string memory)"]),o=new P(this.$config.iggyPostAddress,u,a);s||(s=await o.uri(t),localStorage.setItem("minted-post-"+t,s));const i=atob(s.substring(29)),c=JSON.parse(i),n=c.external_url.split("?id=").pop();this.image=c.image;const g=c.attributes[2].value,f={year:"numeric",month:"long",day:"numeric"};this.created=new Date(g*1e3).toLocaleDateString("en-US",f);let{data:b,error:_}=await this.$orbis.getPost(n);this.post=b,_&&(console.log("Orbis error:",_),this.toast("The post has been deleted.",{type:"warning"})),this.address&&(this.currentUserBalance=sessionStorage.getItem("balanceOf-"+this.address+"-postNft-"+t),this.currentUserBalance||(this.currentUserBalance=Number(await o.balanceOf(this.address,t)),sessionStorage.setItem("balanceOf-"+this.address+"-postNft-"+t,this.currentUserBalance)))}},setup(){const t=v(),s=T(),{address:a,isActivated:u,chainId:o,signer:i}=j();return{address:a,isActivated:u,chainId:o,route:t,signer:i,toast:s}},watch:{getQueryId(t,s){this.getPostObject()}}},x={key:0,class:"card mb-3 border scroll-500"},F={class:"card-body row"},S=e("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),A=[S],M={class:"col-sm-12 col-md-6 offset-md-3 mb-3"},Q=["src"],V={key:1,class:"card mb-3 border"},D={class:"card-body"},E=e("h4",{class:"mb-3 text-body"},"Info",-1),H={class:"text-break"},q={key:0},G={class:"text-primary"},J=["href"],K=e("i",{class:"bi bi-box-arrow-up-right"},null,-1),L=["href"],R=e("i",{class:"bi bi-box-arrow-up-right"},null,-1);function Y(t,s,a,u,o,i){const c=w,n=k,g=I,f=B("ChatPost");return d(),p("div",null,[r(g,null,{default:y(()=>[r(c,null,{default:y(()=>[l("Post NFT | "+h(t.$config.projectMetadataTitle),1)]),_:1}),r(n,{property:"og:title",content:"Post NFT | "+t.$config.projectMetadataTitle},null,8,["content"]),r(n,{name:"description",content:"Check out this minted post NFT on "+t.$config.projectName+"!"},null,8,["content"]),r(n,{property:"og:image",content:t.$config.projectUrl+t.$config.previewImagePostNft},null,8,["content"]),r(n,{property:"og:description",content:"Check out this minted post NFT on "+t.$config.projectName+"!"},null,8,["content"]),r(n,{name:"twitter:image",content:t.$config.projectUrl+t.$config.previewImagePostNft},null,8,["content"]),r(n,{name:"twitter:description",content:"Check out this minted post NFT on "+t.$config.projectName+"!"},null,8,["content"])]),_:1}),o.image?(d(),p("div",x,[e("div",F,[e("p",{class:"fs-3",onClick:s[0]||(s[0]=b=>t.$router.back())},A),e("div",M,[e("img",{class:"img-fluid rounded",src:o.image},null,8,Q)])])])):m("",!0),o.image?(d(),p("div",V,[e("div",D,[E,e("ul",H,[e("li",null,"NFT ID: "+h(i.getQueryId),1),e("li",null,"First minted on: "+h(o.created),1),o.currentUserBalance||o.currentUserBalance===0?(d(),p("li",q,[l(" You own "),e("span",G,h(o.currentUserBalance),1),l(" of these post NFTs ")])):m("",!0),e("li",null,[e("a",{class:"text-decoration-none",target:"_blank",href:t.$config.marketplacePostNftItemUrl+i.getQueryId},[l(" See it on NFT marketplace "),K],8,J)]),e("li",null,[e("a",{class:"text-decoration-none",target:"_blank",href:t.$config.blockExplorerBaseUrl+"/token/"+t.$config.iggyPostAddress},[l(" Smart contract on block explorer "),R],8,L)])])])])):m("",!0),o.post?(d(),$(f,{key:2,post:o.post,showQuotedPost:!0,orbisContext:i.getOrbisContext},null,8,["post","orbisContext"])):m("",!0)])}const dt=N(O,[["render",Y]]);export{dt as default};
