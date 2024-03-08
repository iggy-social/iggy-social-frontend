import{H as F,T as N,M as U}from"./components.809eef41.js";import{a as I,I as S,C as M,l as E,r as p,o,b as n,m as a,F as k,G as O,e as m,f as s,t as h,q as v,A as L,x as $,T as x,c as b,u as P,i as u,w as _,D as C,y as B,z as j,h as V,U as z}from"./entry.8adfaf73.js";import{g as T}from"./textUtils.8bf81eed.js";import{u as q}from"./user.0002346b.js";import{P as H,g as W,a as G}from"./domainUtils.9e1fe36f.js";import{F as K}from"./FileUploadModal.83b46c19.js";import{M as Y}from"./MintedPostImage.5a34d07c.js";import{C as Z}from"./ChatFeed.8ef10cce.js";import{g as J}from"./balanceUtils.7bf4fe0f.js";import{a as Q,s as A}from"./storageUtils.9684873b.js";import"./composables.9fe2c590.js";import"./site.daf1e42a.js";import"./ChatPost.7eed36a6.js";import"./WaitingToast.9fc6f529.js";import"./ConnectWalletButton.d2d4d686.js";const R={name:"UserMintedPosts",props:["address"],data(){return{loadingMintedPosts:!1,mintedPostIds:[],postsDifference:0}},components:{MintedPostImage:Y},mounted(){this.fetchMintedPostIds()},methods:{async fetchMintedPostIds(){this.loadingMintedPosts=!0;let e=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(e=this.signer);const i=new S(["function getMintedPostIdsArray(address) external view returns (uint256[] memory)"]);let l=await new M(this.$config.iggyPostStatsAddress,i,e).getMintedPostIdsArray(this.address);l=[...l].reverse(),this.mintedPostIds=l.slice(0,this.$config.profileMintedPostIdsMax),this.postsDifference=l.length-this.mintedPostIds.length,this.loadingMintedPosts=!1}},setup(){const{isActivated:e,chainId:i,signer:r}=E();return{isActivated:e,chainId:i,signer:r}}},X={key:0,class:"d-flex justify-content-center mb-3"},ee=s("span",{class:"spinner-border spinner-border-lg",role:"status","aria-hidden":"true"},null,-1),se=[ee],te={key:1,class:"row"},ie={key:2,class:"d-flex justify-content-center mt-3"},oe={key:3},ne=s("p",null,"No minted posts yet.",-1),ae=[ne];function re(e,i,r,l,t,d){const f=p("MintedPostImage");return o(),n(k,null,[t.loadingMintedPosts?(o(),n("div",X,se)):a("",!0),t.mintedPostIds?(o(),n("div",te,[(o(!0),n(k,null,O(t.mintedPostIds,c=>(o(),n("div",{class:"col-6 col-sm-4 col-md-3 mb-2",key:c},[m(f,{id:c},null,8,["id"])]))),128))])):a("",!0),t.postsDifference>0?(o(),n("div",ie,[s("p",null,"+ "+h(t.postsDifference)+" other minted posts",1)])):a("",!0),!t.loadingMintedPosts&&t.mintedPostIds.length===0?(o(),n("div",oe,ae)):a("",!0)],64)}const de=I(R,[["render",re]]),le={name:"PunkProfile",props:["pAddress","pDomain"],data(){return{balanceAp:0,balanceChatTokenWei:0,currentTab:"posts",domain:this.pDomain,emailForNotificationsSet:!1,followers:0,following:0,lastActivityTimestamp:null,newEmail:null,newImageLink:null,orbisImage:null,orbisProfile:null,uAddress:this.pAddress,uBalance:0,uDid:null,waitingDataLoad:!1,waitingImageUpdate:!1,waitingSetEmail:!1}},components:{ChatFeed:Z,FileUploadModal:K,ProfileImage:H,UserMintedPosts:de},mounted(){this.currentTab=localStorage.getItem("profileCurrentTab"),this.currentTab||(this.currentTab="posts"),(!this.pAddress||!this.pDomain)&&this.fetchAddressAndDomain(),this.checkConnectionToOrbis()},computed:{balanceChatToken(){const e=v(this.balanceChatTokenWei);return e>=0?Math.floor(Number(e)):Number(e).toFixed(4)},balanceEth(){const e=v(this.uBalance);return e>0?Number(e).toFixed(2):Number(e).toFixed(4)},getChatName(){return this.domain&&this.domain.endsWith(this.$config.tldName)?this.domain.replace(this.$config.tldName,""):null},getOrbisContext(){return this.$config.orbisTest?this.$config.orbisTestContext:this.$config.chatChannels.general},isCurrentUser(){return String(this.uAddress).toLowerCase()===String(this.address).toLowerCase()},isEmail(){return!!(this.newEmail&&this.newEmail.includes("@")&&this.newEmail.includes("."))},isImage(){return!!(this.newImageLink&&(this.newImageLink.includes(".jpg")||this.newImageLink.includes(".jpeg")||this.newImageLink.includes(".png")||this.newImageLink.includes(".gif")||this.newImageLink.includes(".webp")))}},methods:{changeCurrentTab(e){this.currentTab=e,localStorage.setItem("profileCurrentTab",e)},async changeImage(){if(this.userStore.getIsConnectedToOrbis){this.waitingImageUpdate=!0,this.orbisProfile||(this.orbisProfile={pfp:"",username:""}),this.orbisProfile.pfp=this.newImageLink,!this.orbisProfile.username&&this.domain&&(this.orbisProfile.username=this.domain);const e=await this.$orbis.updateProfile(this.orbisProfile);e.status!==200?(console.log("Error: ",e),this.toast(e.result,{type:"error"}),this.waitingImageUpdate=!1):(this.orbisImage=this.newImageLink,this.userStore.setOrbisImage(this.newImageLink),sessionStorage.setItem(String(this.address).toLowerCase()+"-img",this.newImageLink),this.toast("Image successfully updated!",{type:"success"}),this.waitingImageUpdate=!1)}else this.toast("Please connect to chat first",{type:"error"})},async checkConnectionToOrbis(){this.userStore.getIsConnectedToOrbis||(await this.$orbis.isConnected()?(this.userStore.setIsConnectedToOrbis(!0),this.$orbis.session&&!this.userStore.getDid&&(this.userStore.setDid(this.$orbis.session.did._id),this.userStore.setDidParent(this.$orbis.session.did._parentId))):this.userStore.setIsConnectedToOrbis(!1))},async connectToOrbis(){if(!this.userStore.getIsConnectedToOrbis){let e=await this.$orbis.connect_v2({provider:this.signer.provider.provider,lit:!1});e.status==200?(this.userStore.setIsConnectedToOrbis(!0),this.$orbis.session&&(this.userStore.setDid(this.$orbis.session.did._id),this.userStore.setDidParent(this.$orbis.session.did._parentId))):(console.log("Error connecting to Ceramic: ",e),this.toast(e.result,{type:"error"}))}},async fetchAddressAndDomain(){if(this.waitingDataLoad=!0,this.$route.query.id){const i=this.$route.query.id;i.includes(".")?this.domain=i:this.uAddress=i}else this.uAddress=this.address;!this.domain&&this.uAddress&&(this.domain=Q(window,this.uAddress));let e=this.$getFallbackProvider(this.$config.supportedChainId);if(this.isActivated&&this.chainId===this.$config.supportedChainId&&(e=this.signer),!this.domain&&this.uAddress){const i=await W(this.uAddress,e);i&&(this.domain=i+this.$config.tldName,A(window,this.uAddress,this.domain))}if(this.domain&&!this.uAddress){const i=await G(String(this.domain).toLowerCase().split(".")[0],e);i!==L&&(this.uAddress=i),A(window,this.uAddress,this.domain)}await this.fetchOrbisProfile(),await this.fetchBalance()},async fetchBalance(){if(this.uAddress){let e=this.$getFallbackProvider(this.$config.supportedChainId);if(this.uBalance=await e.getBalance(this.uAddress),this.$config.chatTokenAddress){const i=new S(["function balanceOf(address owner) view returns (uint256)"]),r=new M(this.$config.chatTokenAddress,i,e);this.balanceChatTokenWei=await r.balanceOf(this.uAddress)}this.$config.activityPointsAddress&&this.$config.showFeatures.activityPoints&&(this.balanceAp=await J(this.uAddress,e))}},async fetchOrbisProfile(){if(this.orbisProfile={pfp:"",username:""},this.uAddress){let{data:e,error:i}=await this.$orbis.getDids(this.uAddress);if(e[0]?.did){this.uDid=e[0].did;const r=await this.$orbis.getProfile(e[0].did);r.status===200&&(this.orbisProfile=r.data.details.profile,r&&r.data.details.profile&&r.data.details.profile.pfp&&(this.orbisImage=r.data.details.profile.pfp),r&&(this.followers=r.data.count_followers,this.following=r.data.count_following,this.lastActivityTimestamp=r.data.last_activity_timestamp),r.data.details.encrypted_email?this.emailForNotificationsSet=!0:this.emailForNotificationsSet=!1,this.waitingDataLoad=!1)}this.waitingDataLoad=!1}},async insertImage(e){this.newImageLink=e,this.changeImage()},async setEmailNotifications(e){if(this.userStore.getIsConnectedToOrbis){this.waitingSetEmail=!0,e&&(this.newEmail="");let i=await this.$orbis.setEmail(this.newEmail);i.status!==200?(console.log("Error: ",i),this.toast(i.result,{type:"error"}),this.waitingSetEmail=!1):(this.toast("Email notifications successfully set!",{type:"success"}),this.waitingSetEmail=!1,document.getElementById("setEmailModalClose").click())}else this.toast("Please connect to chat first",{type:"error"})}},setup(){const{address:e,balance:i,chainId:r,isActivated:l,signer:t}=E(),d=q(),f=$();return{address:e,balance:i,chainId:r,isActivated:l,userStore:d,shortenAddress:x,signer:t,toast:f}},watch:{address(){this.fetchAddressAndDomain()}}},ce={class:"card border"},he={class:"card-body"},me=s("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),ue=[me],fe={class:"row"},ge={class:"col-md-3 mt-3"},pe={class:"col-md-9 mt-3"},be={key:0,class:"mb-3"},_e={key:1,class:"mb-3"},ye={class:"mt-4 muted-text",style:{"font-size":"14px"}},we={class:"me-4"},Ce=s("i",{class:"bi bi-wallet me-1"},null,-1),ke={key:0,class:"me-4"},Ie=s("i",{class:"bi bi-wallet me-1"},null,-1),ve={key:1,class:"me-4"},Pe=s("i",{class:"bi bi-wallet me-1"},null,-1),Te={key:2,class:"me-4"},Ae=s("i",{class:"bi bi-key-fill me-2"},null,-1),Se={class:"me-4"},Me=s("i",{class:"bi bi-box-arrow-up-right me-2"},null,-1),Ee=["href"],De={key:2,class:"mt-2"},Fe={class:"dropdown mt-2"},Ne=s("button",{class:"btn btn-primary dropdown-toggle",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},[s("i",{class:"bi bi-sliders"}),u(" Profile settings ")],-1),Ue={class:"dropdown-menu"},Oe={key:0,class:"dropdown-item cursor-pointer","data-bs-toggle":"modal","data-bs-target":"#verifyAccountModal"},Le=s("i",{class:"bi bi-person-check-fill"},null,-1),$e=["data-bs-target"],xe=s("i",{class:"bi bi-person-circle"},null,-1),Be=V('<span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#changeUsernameModal"><i class="bi bi-pencil-square"></i> Change your username </span><span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#changeDefaultPostPriceModal"><i class="bi bi-tags-fill"></i> Change your post minting price </span><span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#setEmailModal"><i class="bi bi-envelope-at-fill"></i> Set email notification for chat </span><span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#chatSettingsModal"><i class="bi bi-gear-fill"></i> Other settings </span><span class="dropdown-item cursor-pointer" data-bs-toggle="modal" data-bs-target="#referralModal"><i class="bi bi-person-plus-fill"></i> Share referral link </span>',5),je=s("i",{class:"bi bi-send"},null,-1),Ve={class:"modal fade",id:"setEmailModal",tabindex:"-1","aria-labelledby":"setEmailModalLabel","aria-hidden":"true"},ze={class:"modal-dialog"},qe={class:"modal-content"},He=s("div",{class:"modal-header"},[s("h1",{class:"modal-title fs-5",id:"setEmailModalLabel"},"Set email notifications"),s("button",{type:"button",id:"setEmailModalClose",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"})],-1),We={class:"modal-body"},Ge={key:0},Ke=s("p",null,"First connect to Ceramic to set email notifications:",-1),Ye={key:1,class:"mt-3"},Ze=s("p",null,"Enter your email address to receive notifications about replies on your posts.",-1),Je=s("p",null,"The email address will be encrypted and will not be publicly visible.",-1),Qe={key:0},Re={key:1},Xe={key:2,class:"text-danger"},es={class:"modal-footer"},ss=s("button",{type:"button",class:"btn btn-secondary","data-bs-dismiss":"modal"},"Close",-1),ts=["disabled"],is={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"},os={class:"card border mt-3 mb-3"},ns={class:"card-body"},as={class:"nav nav-tabs nav-fill"},rs={class:"nav-item"},ds={class:"nav-item"},ls={class:"tab-content mt-3"},cs={key:0},hs={key:1};function ms(e,i,r,l,t,d){const f=p("ProfileImage"),c=z,y=p("FileUploadModal"),w=p("ChatFeed"),D=p("UserMintedPosts");return o(),n("div",null,[s("div",ce,[s("div",he,[s("p",{class:"fs-3",onClick:i[0]||(i[0]=g=>e.$router.back())},ue),s("div",fe,[s("div",ge,[t.uAddress?(o(),b(f,{key:t.orbisImage,class:"img-fluid img-thumbnail rounded-circle col-6 col-md-12",address:t.uAddress,domain:t.domain,image:t.orbisImage},null,8,["address","domain","image"])):a("",!0)]),s("div",pe,[t.domain&&!d.isCurrentUser?(o(),n("h3",be,h(P(T)(t.domain)),1)):a("",!0),t.domain&&d.isCurrentUser?(o(),n("h3",_e,h(P(T)(l.userStore.getDefaultDomain)),1)):a("",!0),s("div",ye,[s("p",we,[Ce,u(" "+h(d.balanceEth)+" "+h(e.$config.tokenSymbol),1)]),e.$config.chatTokenAddress?(o(),n("p",ke,[Ie,u(" "+h(d.balanceChatToken)+" "+h(e.$config.chatTokenSymbol),1)])):a("",!0),e.$config.activityPointsAddress&&e.$config.showFeatures.activityPoints?(o(),n("p",ve,[Pe,u(" "+h(t.balanceAp)+" AP ",1)])):a("",!0),e.$config.keysAddress&&e.$config.showFeatures.friendKeys&&d.getChatName?(o(),n("p",Te,[Ae,m(c,{class:"body-color hover-color",to:"/keys/?username="+d.getChatName},{default:_(()=>[u("Get Friend Key")]),_:1},8,["to"])])):a("",!0),s("p",Se,[Me,s("a",{href:e.$config.blockExplorerBaseUrl+"/address/"+t.uAddress,target:"_blank",class:"body-color hover-color",style:{"text-decoration":"none"}},h(l.shortenAddress(t.uAddress)),9,Ee)])]),d.isCurrentUser?(o(),n("div",De,[s("div",Fe,[Ne,s("div",Ue,[l.userStore.getIsConnectedToOrbis?a("",!0):(o(),n("span",Oe,[Le,u(" Verify account ownership ")])),s("span",{class:C(["dropdown-item cursor-pointer",l.userStore.getIsConnectedToOrbis?"":"disabled"]),"data-bs-toggle":"modal","data-bs-target":"#fileUploadModal"+e.$.uid},[xe,u(" Change your profile picture ")],10,$e),Be])])])):a("",!0),t.domain&&!d.isCurrentUser&&e.$config.showFeatures.sendTokens?(o(),b(c,{key:3,class:"btn btn-primary mt-2",to:"/send-tokens/?to="+t.domain},{default:_(()=>[je,u(" Send tokens to "+h(t.domain),1)]),_:1},8,["to"])):a("",!0)])])]),s("div",Ve,[s("div",ze,[s("div",qe,[He,s("div",We,[l.userStore.getIsConnectedToOrbis?a("",!0):(o(),n("div",Ge,[Ke,s("button",{class:"btn btn-primary",onClick:i[1]||(i[1]=(...g)=>d.connectToOrbis&&d.connectToOrbis(...g))},"Connect to Ceramic")])),l.userStore.getIsConnectedToOrbis?(o(),n("div",Ye,[Ze,Je,t.emailForNotificationsSet?(o(),n("p",Qe," Currently, the email for notifications is already set. You can change it by entering a new email address below: ")):a("",!0),t.emailForNotificationsSet?a("",!0):(o(),n("p",Re," Currently, the email for notifications is NOT yet set. You can add your email address below: ")),B(s("input",{"onUpdate:modelValue":i[2]||(i[2]=g=>t.newEmail=g),type:"email",class:"form-control mt-2",placeholder:"Enter email address"},null,512),[[j,t.newEmail]]),t.newEmail&&!d.isEmail?(o(),n("small",Xe," Error: The entered text is not an email. ")):a("",!0)])):a("",!0)]),s("div",es,[ss,s("button",{type:"button",class:"btn btn-primary",onClick:i[3]||(i[3]=g=>d.setEmailNotifications(!1)),disabled:!l.userStore.getIsConnectedToOrbis||!d.isEmail},[t.waitingSetEmail?(o(),n("span",is)):a("",!0),u(" Submit email ")],8,ts)])])])]),l.userStore.getIsConnectedToOrbis?(o(),b(y,{key:0,onProcessFileUrl:d.insertImage,title:"Change profile image",infoText:"Upload a new profile picture.",componentId:e.$.uid,maxFileSize:e.$config.fileUploadSizeLimit},null,8,["onProcessFileUrl","componentId","maxFileSize"])):a("",!0)]),s("div",os,[s("div",ns,[s("ul",as,[s("li",rs,[s("button",{class:C(["nav-link",t.currentTab==="posts"?"active":""]),onClick:i[4]||(i[4]=g=>d.changeCurrentTab("posts"))},"Posts",2)]),s("li",ds,[s("button",{class:C(["nav-link",t.currentTab==="mints"?"active":""]),onClick:i[5]||(i[5]=g=>d.changeCurrentTab("mints"))},"Mints",2)])]),s("div",ls,[t.currentTab==="posts"&&t.uDid?(o(),n("div",cs,[m(w,{byDid:t.uDid,hideCommentBox:!0,orbisContext:d.getOrbisContext},null,8,["byDid","orbisContext"])])):a("",!0),t.currentTab==="mints"&&t.uAddress?(o(),n("div",hs,[m(D,{address:t.uAddress},null,8,["address"])])):a("",!0)])])])])}const us=I(le,[["render",ms]]),fs={name:"Profile",components:{PunkProfile:us},setup(){}};function gs(e,i,r,l,t,d){const f=N,c=U,y=F,w=p("PunkProfile");return o(),n(k,null,[m(y,null,{default:_(()=>[m(f,null,{default:_(()=>[u("Profile | "+h(e.$config.projectMetadataTitle),1)]),_:1}),m(c,{name:"description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"]),m(c,{property:"og:image",content:e.$config.projectUrl+e.$config.previewImageProfile},null,8,["content"]),m(c,{property:"og:description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"]),m(c,{name:"twitter:image",content:e.$config.projectUrl+e.$config.previewImageProfile},null,8,["content"]),m(c,{name:"twitter:description",content:"Check out this profile on "+e.$config.projectName+"!"},null,8,["content"])]),_:1}),(o(),b(w,{key:e.$route.query.id,class:"mt-1"}))],64)}const Ds=I(fs,[["render",gs]]);export{Ds as default};
