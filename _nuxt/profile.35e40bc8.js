import{H as $,T as B,M as L}from"./components.4780fbf2.js";import{a as y,ae as U,r as g,o as r,b as d,f as s,ah as C,t as m,e as h,l,af as x,ag as F,i as u,c as f,ad as D,u as v,w,am as E,F as M}from"./entry.e9f54a4e.js";import{g as T}from"./textUtils.04f7408a.js";import{I as A,C as N,u as P,f as I,v as W}from"./ethers.6b4bcd4d.js";import{u as j}from"./user.57d29c05.js";import{C as V,S as z}from"./SwitchChainButton.097b53cb.js";import{I as H}from"./Image.bbfab45e.js";import{W as q}from"./WaitingToast.0869afeb.js";import{F as O}from"./FileUploadInput.ec3be7ee.js";import{u as J}from"./site.a477a34c.js";import{P as Y,g as Z,a as G}from"./domainUtils.6b686200.js";import{f as K,s as S,b as Q}from"./storageUtils.91141f3a.js";import"./composables.086ed08f.js";import"./balanceUtils.2234cc62.js";const R={name:"ChangePfpModal",props:["componentId","domainName","storageType"],emits:["processFileUrl"],components:{ConnectWalletButton:V,FileUploadInput:O,Image:H,SwitchChainButton:z},data(){return{currentTab:"upload",imageLink:null,waitingSubmit:!1}},mounted(){this.fileUploadEnabled||(this.currentTab="paste")},computed:{domainNameWithoutTld(){return this.domainName.replace(this.$config.tldName,"")},fileUploadEnabled(){return this.siteStore.getFileUploadEnabled},isSupportedChain(){return this.chainId===this.$config.supportedChainId}},methods:{processUploadedFileUrl(e){this.imageLink=e,this.currentTab="paste"},async submitToBlockchain(){this.waitingSubmit=!0;const e=new A(["function getDomainData(string calldata _domainName) public view returns(string memory)","function editData(string calldata _domainName, string calldata _data) external"]),i=new N(this.$config.punkTldAddress,e,this.signer);let o=await i.getDomainData(String(this.domainNameWithoutTld).toLowerCase());try{o=JSON.parse(o)}catch{o={}}o.image=this.imageLink;try{const n=await i.editData(String(this.domainNameWithoutTld).toLowerCase(),JSON.stringify(o)),t=this.toast({component:q,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+n.hash,"_blank").focus()}),a=await n.wait();a.status===1?(this.waitingSubmit=!1,this.toast.dismiss(t),this.toast("You have successfully changed your profile image!",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+n.hash,"_blank").focus()}),this.$emit("processFileUrl",this.imageLink),document.getElementById("closeChangeImageModal"+this.componentId).click()):(this.waitingSubmit=!1,this.toast.dismiss(t),this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+n.hash,"_blank").focus()}),console.log(a))}catch(n){console.error(n);try{let t=n.message.split("reason=")[1];t=t.split(", method=")[0],t=t.replace(/"/g,""),t=t.replace("execution reverted:","Error:"),console.log(t),this.toast(t,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waitingSubmit=!1}this.waitingSubmit=!1}},setup(){const{signer:e,chainId:i,isActivated:o}=P(),n=J(),t=U();return{signer:e,chainId:i,isActivated:o,siteStore:n,toast:t}},watch:{fileUploadEnabled(){this.fileUploadEnabled?this.currentTab="upload":this.currentTab="paste"},imageLink(e,i){i&&(this.currentTab="paste")}}},X=["id","aria-labelledby"],ee={class:"modal-dialog"},te={class:"modal-content"},se={class:"modal-header"},ie=["id"],oe=["id"],ne={class:"modal-body mb-4"},ae={class:"nav nav-tabs nav-fill"},re={class:"nav-item"},le=["disabled"],de={class:"nav-item"},ce={class:"tab-content mt-3"},me={key:0},he={key:1},ue=s("p",null,"Submit the image link to blockchain",-1),pe={key:0,class:"mb-3"},ge=s("small",null,"If image didn't appear above, then something is wrong with the link you added (wait until the loading indicator completes).",-1),fe=["disabled"],be={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"};function _e(e,i,o,n,t,a){const p=g("FileUploadInput"),c=g("Image"),b=g("ConnectWalletButton"),k=g("SwitchChainButton");return r(),d("div",{class:"modal fade",id:"changeImageModal"+o.componentId,tabindex:"-1","aria-labelledby":"changeImageModalLabel"+o.componentId,"aria-hidden":"true"},[s("div",ee,[s("div",te,[s("div",se,[s("h1",{class:"modal-title fs-5",id:"changeImageModalLabel"+o.componentId},"Change your profile picture",8,ie),s("button",{id:"closeChangeImageModal"+o.componentId,type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,8,oe)]),s("div",ne,[s("ul",ae,[s("li",re,[s("button",{disabled:!this.fileUploadEnabled,class:C(["nav-link",t.currentTab==="upload"?"active":""]),onClick:i[0]||(i[0]=_=>t.currentTab="upload")}," Upload ",10,le)]),s("li",de,[s("button",{class:C(["nav-link",t.currentTab==="paste"?"active":""]),onClick:i[1]||(i[1]=_=>t.currentTab="paste")}," Paste Link ",2)])]),s("div",ce,[t.currentTab==="upload"?(r(),d("div",me,[s("p",null,"Upload your new profile image "+m(o.domainName)+".",1),h(p,{btnCls:"btn btn-primary",maxFileSize:e.$config.fileUploadSizeLimit,storageType:o.storageType,onProcessUploadedFileUrl:a.processUploadedFileUrl},null,8,["maxFileSize","storageType","onProcessUploadedFileUrl"])])):l("",!0),t.currentTab==="paste"?(r(),d("div",he,[ue,x(s("input",{"onUpdate:modelValue":i[2]||(i[2]=_=>t.imageLink=_),type:"text",class:"form-control mb-3",placeholder:"Enter http link to file"},null,512),[[F,t.imageLink]]),t.imageLink?(r(),d("div",pe,[h(c,{url:t.imageLink,cls:"img-thumbnail img-fluid",style:{"max-width":"100px"}},null,8,["url"]),ge])):l("",!0),n.isActivated&&a.isSupportedChain?(r(),d("button",{key:1,class:"btn btn-primary",onClick:i[3]||(i[3]=(..._)=>a.submitToBlockchain&&a.submitToBlockchain(..._)),disabled:!t.imageLink||t.waitingSubmit},[t.waitingSubmit?(r(),d("span",be)):l("",!0),u(" Submit to blockchain ")],8,fe)):l("",!0),n.isActivated?l("",!0):(r(),f(b,{key:2,class:"btn btn-outline-primary mt-2 mb-2",btnText:"Connect Wallet"})),n.isActivated&&!a.isSupportedChain?(r(),f(k,{key:3})):l("",!0)])):l("",!0)])])])])],8,X)}const ke=y(R,[["render",_e]]),we={name:"PunkProfile",props:["pAddress","pDomain"],data(){return{balanceChatTokenWei:0,domain:this.pDomain,newEmail:null,newImageLink:null,uAddress:this.pAddress,uBalance:0,waitingDataLoad:!1,waitingImageUpdate:!1,waitingSetEmail:!1}},components:{ChangePfpModal:ke,ProfileImage:Y},mounted(){(!this.pAddress||!this.pDomain)&&this.fetchAddressAndDomain()},computed:{balanceChatToken(){const e=I(this.balanceChatTokenWei);return e>=0?Math.floor(Number(e)):Number(e).toFixed(4)},balanceEth(){const e=I(this.uBalance);return e>0?Number(e).toFixed(2):Number(e).toFixed(4)},isCurrentUser(){return String(this.uAddress).toLowerCase()===String(this.address).toLowerCase()},domainWithoutExtension(){return this.domain?String(this.domain).replace(this.$config.tldName,""):null}},methods:{changeCurrentTab(e){this.currentTab=e,localStorage.setItem("profileCurrentTab",e)},async fetchAddressAndDomain(){if(this.waitingDataLoad=!0,this.$route.query.id){const i=this.$route.query.id;i.includes(".")?this.domain=i:this.uAddress=i}else this.uAddress=this.address;!this.domain&&this.uAddress&&(this.domain=K(window,this.uAddress));let e=this.$getFallbackProvider(this.$config.supportedChainId);if(this.isActivated&&this.chainId===this.$config.supportedChainId&&(e=this.signer),!this.domain&&this.uAddress){const i=await Z(this.uAddress,e);i&&(this.domain=String(i).replace(this.$config.tldName,"")+this.$config.tldName,S(window,this.uAddress,this.domain))}if(this.domain&&!this.uAddress){const i=await G(String(this.domain).toLowerCase().split(".")[0],e);i!==D&&(this.uAddress=i),this.domain=String(this.domain).replace(this.$config.tldName,"")+this.$config.tldName,S(window,this.uAddress,this.domain)}await this.fetchBalance()},async fetchBalance(){if(this.uAddress){let e=this.$getFallbackProvider(this.$config.supportedChainId);if(this.uBalance=await e.getBalance(this.uAddress),this.$config.chatTokenAddress){const i=new A(["function balanceOf(address owner) view returns (uint256)"]),o=new N(this.$config.chatTokenAddress,i,e);this.balanceChatTokenWei=await o.balanceOf(this.uAddress)}}},async insertImage(e){this.newImageLink=e,e&&Q(window,this.domainWithoutExtension,{image:e},"img")}},setup(){const{address:e,balance:i,chainId:o,isActivated:n,signer:t}=P(),a=j(),p=U();return{address:e,balance:i,chainId:o,isActivated:n,userStore:a,shortenAddress:W,signer:t,toast:p}},watch:{address(){this.fetchAddressAndDomain()}}},ye={class:"card border"},Ce={class:"card-body"},ve=s("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),Te=[ve],Ie={class:"row"},Se={class:"col-md-3 mt-3"},Ue={class:"col-md-9 mt-3"},Ae={key:0,class:"mb-3"},Ne={key:1,class:"mb-3"},Pe={class:"mt-4 muted-text",style:{"font-size":"14px"}},$e={class:"me-4"},Be=s("i",{class:"bi bi-wallet me-1"},null,-1),Le={key:0,class:"me-4"},xe=s("i",{class:"bi bi-wallet me-1"},null,-1),Fe={class:"me-4"},De=s("i",{class:"bi bi-box-arrow-up-right me-2"},null,-1),Ee=["href"],Me={key:2,class:"mt-2"},We={class:"dropdown mt-2"},je=s("button",{class:"btn btn-primary dropdown-toggle",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},[s("i",{class:"bi bi-sliders"}),u(" Profile settings ")],-1),Ve={class:"dropdown-menu"},ze=["data-bs-target"],He=s("i",{class:"bi bi-person-circle"},null,-1),qe=s("span",{class:"dropdown-item cursor-pointer","data-bs-toggle":"modal","data-bs-target":"#changeUsernameModal"},[s("i",{class:"bi bi-pencil-square"}),u(" Change your username ")],-1),Oe=s("i",{class:"bi bi-send"},null,-1);function Je(e,i,o,n,t,a){const p=g("ProfileImage"),c=E,b=g("ChangePfpModal");return r(),d("div",null,[s("div",ye,[s("div",Ce,[s("p",{class:"fs-3",onClick:i[0]||(i[0]=k=>e.$router.back())},Te),s("div",Ie,[s("div",Se,[(r(),f(p,{key:t.domain,class:"img-fluid img-thumbnail rounded-circle force-circle col-6 col-md-12",domain:t.domain,image:t.newImageLink},null,8,["domain","image"]))]),s("div",Ue,[t.domain&&!a.isCurrentUser?(r(),d("h3",Ae,m(v(T)(t.domain)),1)):l("",!0),t.domain&&a.isCurrentUser?(r(),d("h3",Ne,m(v(T)(n.userStore.getDefaultDomain)),1)):l("",!0),s("div",Pe,[s("p",$e,[Be,u(" "+m(a.balanceEth)+" "+m(e.$config.tokenSymbol),1)]),e.$config.chatTokenAddress?(r(),d("p",Le,[xe,u(" "+m(a.balanceChatToken)+" "+m(e.$config.chatTokenSymbol),1)])):l("",!0),s("p",Fe,[De,s("a",{href:e.$config.blockExplorerBaseUrl+"/address/"+t.uAddress,target:"_blank",class:"body-color hover-color",style:{"text-decoration":"none"}},m(n.shortenAddress(t.uAddress)),9,Ee)])]),a.isCurrentUser?(r(),d("div",Me,[s("div",We,[je,s("div",Ve,[s("span",{class:"dropdown-item cursor-pointer","data-bs-toggle":"modal","data-bs-target":"#changeImageModal"+e.$.uid},[He,u(" Change your profile picture ")],8,ze),qe])])])):l("",!0),t.domain&&!a.isCurrentUser&&e.$config.showFeatures.sendTokens?(r(),f(c,{key:3,class:"btn btn-primary mt-2",to:"/send-tokens/?to="+t.domain},{default:w(()=>[Oe,u(" Send a tip ")]),_:1},8,["to"])):l("",!0)])])]),a.isCurrentUser?(r(),f(b,{key:t.domain,domainName:t.domain,componentId:e.$.uid,storageType:"arweave",onProcessFileUrl:a.insertImage},null,8,["domainName","componentId","onProcessFileUrl"])):l("",!0)])])}const Ye=y(we,[["render",Je]]),Ze={name:"Profile",components:{PunkProfile:Ye},setup(){}};function Ge(e,i,o,n,t,a){const p=B,c=L,b=$,k=g("PunkProfile");return r(),d(M,null,[h(b,null,{default:w(()=>[h(p,null,{default:w(()=>[u("Profile | "+m(e.$config.projectMetadataTitle),1)]),_:1}),h(c,{name:"description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"]),h(c,{property:"og:image",content:e.$config.projectUrl+e.$config.previewImageProfile},null,8,["content"]),h(c,{property:"og:description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"]),h(c,{name:"twitter:image",content:e.$config.projectUrl+e.$config.previewImageProfile},null,8,["content"]),h(c,{name:"twitter:description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"])]),_:1}),(r(),f(k,{key:e.$route.query.id,class:"mt-1"}))],64)}const ct=y(Ze,[["render",Ge]]);export{ct as default};
