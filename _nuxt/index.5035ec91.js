import{H as k,T,M as A}from"./components.e4131225.js";import{a as C,I as b,G as w,J as E,o as i,b as l,f as s,L as M,M as B,l as m,i as N,C as S,e as f,w as _,F as y,a0 as x,aa as P,r as v,t as p,c as L}from"./entry.c086bcfc.js";import{u as F}from"./ethers.ef37d6da.js";import{I as D}from"./Image.98a77cf8.js";import{a as j}from"./ipfsUtils.1cb2baa1.js";import{b as U,c as V}from"./storageUtils.dde23a19.js";import"./composables.c1317a93.js";const q={name:"SearchNftModal",data(){return{componentId:null,searchText:"",waitingFind:!1,findError:!1}},mounted(){this.componentId=this.$.uid},methods:{async findNft(){if(this.waitingFind=!0,this.findError=!1,this.searchText){if(String(this.searchText).toLowerCase().startsWith("0x"))return document.getElementById("closeModal-"+this.componentId).click(),this.$router.push({path:"/nft/collection/",query:{id:this.searchText}}),this.searchText=null,this.waitingFind=!1;{const e=new b(["function getNftContractAddress(string calldata _uniqueId) external view returns(address)"]);let t=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(t=this.signer);const c=await new w(this.$config.nftLaunchpadBondingAddress,e,t).getNftContractAddress(this.searchText);if(c!==E)return document.getElementById("closeModal-"+this.componentId).click(),this.$router.push({path:"/nft/collection/",query:{id:c}}),this.searchText=null,this.waitingFind=!1}return this.findError=!0,this.waitingFind=!1}}},setup(){const{chainId:e,isActivated:t,signer:r}=F();return{chainId:e,isActivated:t,signer:r}}},H=["aria-labelledby"],W={class:"modal-dialog"},G={class:"modal-content"},J={class:"modal-header"},Z=["id"],z=["id"],K={class:"modal-body"},O={class:"mb-3"},Q=["for"],R=["for"],X={key:0},Y={class:"modal-footer"},tt=s("button",{type:"button",class:"btn btn-secondary","data-bs-dismiss":"modal"},"Close",-1),et=["disabled"],st={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"};function nt(e,t,r,c,n,d){return i(),l("div",{class:"modal fade",id:"searchNftModal",tabindex:"-1","aria-labelledby":"modalLabel-"+n.componentId,"aria-hidden":"true"},[s("div",W,[s("div",G,[s("div",J,[s("h1",{class:"modal-title fs-5",id:"modalLabel-"+n.componentId},"Find NFT collection",8,Z),s("button",{id:"closeModal-"+n.componentId,type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,8,z)]),s("div",K,[s("div",O,[s("label",{for:"input-"+n.componentId,class:"form-label"},"Enter NFT collection address or unique ID:",8,Q),M(s("input",{"onUpdate:modelValue":t[0]||(t[0]=a=>n.searchText=a),type:"text",class:"form-control",for:"input-"+n.componentId},null,8,R),[[B,n.searchText]])]),n.findError?(i(),l("p",X,"Error: Collection not found...")):m("",!0)]),s("div",Y,[tt,s("button",{onClick:t[1]||(t[1]=(...a)=>d.findNft&&d.findNft(...a)),type:"button",class:"btn btn-primary",disabled:n.waitingFind},[n.waitingFind?(i(),l("span",st)):m("",!0),N(" Find ")],8,et)])])])],8,H)}const at=C(q,[["render",nt]]),ot={name:"Nft",props:["hideBackButton"],data(){return{allNftsArrayLength:0,allNftsIndexStart:0,allNftsIndexEnd:0,featuredNfts:[],lastNfts:[],waitingData:!1}},components:{Image:D,SearchNftModal:at},mounted(){this.$config.nftLaunchpadBondingAddress&&(this.fetchFeaturedNfts(),this.fetchLastNfts())},computed:{showLoadMoreButton(){return this.allNftsIndexEnd>0}},methods:{async fetchFeaturedNfts(){this.waitingData=!0;let e=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(e=this.signer);const t=new b(["function getFeaturedNftContracts(uint256 amount) external view returns(address[] memory)"]),c=await new w(this.$config.nftLaunchpadBondingAddress,t,e).getFeaturedNftContracts(4);await this.parseNftsArray(c,this.featuredNfts,e)},async fetchLastNfts(){this.waitingData=!0;let e=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(e=this.signer);const t=new b(["function getLastNftContracts(uint256 amount) external view returns(address[] memory)","function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)","function getNftContractsArrayLength() external view returns(uint256)"]),r=new w(this.$config.nftLaunchpadBondingAddress,t,e);if(Number(this.allNftsArrayLength)===0&&(this.allNftsArrayLength=await r.getNftContractsArrayLength()),Number(this.allNftsArrayLength)===1){const c=await r.getLastNftContracts(1);await this.parseNftsArray(c,this.lastNfts,e)}else if(Number(this.allNftsArrayLength)>1){this.allNftsIndexEnd===0&&(this.allNftsIndexEnd=this.allNftsArrayLength-1,this.allNftsArrayLength<this.$config.nftLaunchpadLatestItems?this.allNftsIndexStart=0:this.allNftsIndexStart=this.allNftsArrayLength-this.$config.nftLaunchpadLatestItems);const n=[...await r.getNftContracts(this.allNftsIndexStart,this.allNftsIndexEnd)];n.reverse(),await this.parseNftsArray(n,this.lastNfts,e),this.allNftsIndexEnd>this.$config.nftLaunchpadLatestItems?this.allNftsIndexEnd=this.allNftsIndexEnd-this.$config.nftLaunchpadLatestItems:this.allNftsIndexEnd=0,this.allNftsIndexStart>this.$config.nftLaunchpadLatestItems?this.allNftsIndexStart=this.allNftsIndexStart-this.$config.nftLaunchpadLatestItems:this.allNftsIndexStart=0}this.waitingData=!1},formatPrice(e){if(e===null)return null;const t=Number(S(e));return t>100?t.toFixed(0):t>1?t.toFixed(2):t>.1?t.toFixed(4):t>.01?t.toFixed(5):t>.001?t.toFixed(6):t>1e-4?t.toFixed(7):t>1e-5?t.toFixed(8):t>1e-6?t.toFixed(9):t},async parseNftsArray(e,t,r){const c=new b(["function collectionPreview() public view returns (string memory)","function getMintPrice() public view returns (uint256)","function name() public view returns (string memory)"]);for(let n=0;n<e.length;n++){const d=new w(e[n],c,r);let a=U(window,e[n]);a||(a={address:e[n]});let h;a?.name?h=a.name:(h=await d.name(),a.name=h);const I=await d.getMintPrice();let u;a?.image?u=a.image:(u=await d.collectionPreview(),a.image=u);const g=j(u);g&&(u=g,a.image=u),V(window,e[n],a),t.push({address:e[n],image:u,name:h,price:I})}}},setup(){const{address:e,chainId:t,isActivated:r,signer:c}=F();return{address:e,chainId:t,isActivated:r,signer:c}}},it={class:"card border scroll-500"},rt={class:"card-body"},ct=s("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),lt=[ct],dt={class:"d-flex flex-row flex-wrap mt-3"},ft=s("div",{class:"mb-3 me-auto"},"NFT Launchpad",-1),ht={class:"mb-3"},ut=s("i",{class:"bi bi-plus-circle"},null,-1),mt=s("button",{class:"btn btn-outline-primary btn-sm ms-2","data-bs-toggle":"modal","data-bs-target":"#searchNftModal"},[s("i",{class:"bi bi-search"}),N(" Find ")],-1),pt={key:1,class:"mb-3"},gt={key:2,class:"row"},_t={class:"card border mb-3"},Nt={class:"card-body rounded-bottom-3"},bt={class:"card-text mb-1"},wt={class:"card-text"},It={key:3,class:"mt-3 mb-3"},yt={class:"row"},xt={class:"card border mb-3"},vt={class:"card-body rounded-bottom-3"},Lt={class:"card-text mb-1"},Ct={class:"card-text"},Ft={key:4,class:"d-flex justify-content-center mb-3"},$t=s("span",{class:"spinner-border spinner-border-lg",role:"status","aria-hidden":"true"},null,-1),kt=[$t],Tt={key:5,class:"d-grid gap-2"},At=["disabled"],Et={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"};function Mt(e,t,r,c,n,d){const a=T,h=A,I=k,u=P,g=v("Image"),$=v("SearchNftModal");return i(),l(y,null,[f(I,null,{default:_(()=>[f(a,null,{default:_(()=>[N("NFT Launchpad | "+p(e.$config.projectMetadataTitle),1)]),_:1}),f(h,{property:"og:title",content:"NFT Launchpad | "+e.$config.projectMetadataTitle},null,8,["content"]),f(h,{name:"description",content:"Check out these awesome NFT collections on "+e.$config.projectName+"!"},null,8,["content"]),f(h,{property:"og:image",content:e.$config.projectUrl+e.$config.previewImageNftLaunchpad},null,8,["content"]),f(h,{property:"og:description",content:"Check out these awesome NFT collections on "+e.$config.projectName+"!"},null,8,["content"]),f(h,{name:"twitter:image",content:e.$config.projectUrl+e.$config.previewImageNftLaunchpad},null,8,["content"]),f(h,{name:"twitter:description",content:"Check out these awesome NFT collections on "+e.$config.projectName+"!"},null,8,["content"])]),_:1}),s("div",it,[s("div",rt,[r.hideBackButton?m("",!0):(i(),l("p",{key:0,class:"fs-3",onClick:t[0]||(t[0]=o=>e.$router.back())},lt)),s("h3",dt,[ft,s("div",ht,[f(u,{class:"btn btn-outline-primary btn-sm",to:"/nft/create"},{default:_(()=>[ut,N(" Create ")]),_:1}),mt])]),n.featuredNfts.length>0?(i(),l("h4",pt,"Featured")):m("",!0),n.featuredNfts.length>0?(i(),l("div",gt,[(i(!0),l(y,null,x(n.featuredNfts,o=>(i(),L(u,{key:o.address,class:"col-md-3 text-decoration-none",to:"/nft/collection?id="+o.address},{default:_(()=>[s("div",_t,[f(g,{url:o.image,alt:o.name,cls:"card-img-top"},null,8,["url","alt"]),s("div",Nt,[s("p",bt,[s("strong",null,p(o.name),1)]),s("small",wt,p(d.formatPrice(o.price))+" "+p(e.$config.tokenSymbol),1)])])]),_:2},1032,["to"]))),128))])):m("",!0),n.lastNfts.length>0?(i(),l("h4",It,"Latest")):m("",!0),s("div",yt,[(i(!0),l(y,null,x(n.lastNfts,o=>(i(),L(u,{key:o.address,class:"col-md-3 text-decoration-none",to:"/nft/collection?id="+o.address},{default:_(()=>[s("div",xt,[f(g,{url:o.image,alt:o.name,cls:"card-img-top"},null,8,["url","alt"]),s("div",vt,[s("p",Lt,[s("strong",null,p(o.name),1)]),s("small",Ct,p(d.formatPrice(o.price))+" "+p(e.$config.tokenSymbol),1)])])]),_:2},1032,["to"]))),128))]),n.waitingData?(i(),l("div",Ft,kt)):m("",!0),d.showLoadMoreButton?(i(),l("div",Tt,[s("button",{class:"btn btn-primary",onClick:t[1]||(t[1]=(...o)=>d.fetchLastNfts&&d.fetchLastNfts(...o)),disabled:n.waitingData},[n.waitingData?(i(),l("span",Et)):m("",!0),N(" Load more ")],8,At)])):m("",!0)])]),f($)],64)}const qt=C(ot,[["render",Mt]]);export{qt as default};
