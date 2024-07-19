import{H as S,T as P,M as F}from"./components.eed4080b.js";import{u as W}from"./ethers.be01c75b.js";import{a as H,C as p,I as m,G as h,J as T,K as M,b as u,e as y,w as _,f as s,L as E,M as A,$ as I,t as a,c as g,l as d,i as f,F as U,r as b,o as r,h as L}from"./entry.b3e49a4d.js";import{W as w}from"./WaitingToast.f0eb3191.js";import{C as j}from"./ChatFeed.c7fe1707.js";import{K as V}from"./KeysList.e62d3a74.js";import{C as Q}from"./ConnectWalletButton.e56906fa.js";import{S as q}from"./SwitchChainButton.3d208c09.js";import{f as k}from"./storageUtils.5d0698c1.js";import"./composables.6c7f5bcf.js";import"./textUtils.f60b0697.js";import"./ipfsUtils.5193581b.js";import"./ChatPost.cf9bca2b.js";import"./user.a101a299.js";import"./Image.ec74cddb.js";import"./domainUtils.625d868b.js";import"./MintedPostImage.76429a1d.js";import"./site.b9e3a73f.js";import"./FileUploadModal.b9ad9f2e.js";const G={name:"Keys",data(){return{buyKeyPriceWei:null,buyKeyToChat:!1,cleanDomainName:null,domainName:null,domainNotExists:!1,isKeyHolder:!1,sellKeyPriceWei:null,showBuySellButtons:!1,waitingBuy:!1,waitingData:!1,waitingSell:!1}},components:{ChatFeed:j,ConnectWalletButton:Q,KeysList:V,SwitchChainButton:q},mounted(){this.domainName=this.$route.query.username},computed:{buyKeyPrice(){if(this.buyKeyPriceWei){const e=Number(p(this.buyKeyPriceWei));return e>1?e.toFixed(2):e>.1?e.toFixed(4):e>.01?e.toFixed(5):e>.001?e.toFixed(6):e>1e-4?e.toFixed(7):e>1e-5?e.toFixed(8):e>1e-6?e.toFixed(9):e}return null},getQueryUsername(){return this.$route.query.username?this.$route.query.username:null},isSupportedChain(){return this.chainId===this.$config.supportedChainId},sellKeyPrice(){if(this.sellKeyPriceWei){const e=Number(p(this.sellKeyPriceWei));return e>1?e.toFixed(2):e>.1?e.toFixed(4):e>.01?e.toFixed(5):e>.001?e.toFixed(6):e>1e-4?e.toFixed(7):e>1e-5?e.toFixed(8):e>1e-6?e.toFixed(9):e}return null}},methods:{async buyKey(){this.waitingBuy=!0,this.cleanDomainName=this.clean(this.domainName);const e=new m(["function buyKeys(string memory domainName, uint256 amount, address referrer) external payable"]),o=new h(this.$config.keysAddress,e,this.signer);try{const l=await o.buyKeys(this.cleanDomainName,1,k(window),{value:this.buyKeyPriceWei}),i=this.toast({component:w,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),t=await l.wait();t.status===1?(this.toast.dismiss(i),this.toast(this.cleanDomainName+this.$config.tldName+" friend key has been successfully claimed! Now you can chat.",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),document.getElementById("closeBuyKeyModal").click(),this.isKeyHolder=!0,this.buyKeyToChat=!1,this.waitingBuy=!1):(this.toast.dismiss(i),this.waitingBuy=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),console.log(t))}catch(l){console.error(l);try{let i=l.message.split("reason=")[1];i=i.split(", method=")[0],i=i.replace(/"/g,""),i=i.replace("execution reverted:","Error:"),console.log(i),this.toast(i,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waitingBuy=!1}},clean(e){return e.split(".")[0].trim().toLowerCase()},async fetchBuyData(){this.buyKeyPriceWei=null,this.waitingBuy=!0;const e=new m(["function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"]),o=new h(this.$config.keysAddress,e,this.signer);this.buyKeyPriceWei=await o.getBuyPriceAfterFee(this.cleanDomainName,1),this.waitingBuy=!1},async fetchSellData(){this.sellKeyPriceWei=null,this.waitingSell=!0;const e=new m(["function getSellPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"]),o=new h(this.$config.keysAddress,e,this.signer);this.sellKeyPriceWei=await o.getSellPriceAfterFee(this.cleanDomainName,1),console.log("sellKeyPriceWei",this.sellKeyPriceWei),console.log("sellKeyPrice",p(this.sellKeyPriceWei)),this.waitingSell=!1},async getData(){this.cleanDomainName=null,this.isKeyHolder=!1,this.waitingData=!0,this.cleanDomainName=this.clean(this.domainName);const e=new m(["function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)","function getDomainHolder(string memory domainName) external view returns (address)","function isKeyHolder(string memory domainName, address user) external view returns (bool)"]),o=new h(this.$config.keysAddress,e,this.signer);this.isKeyHolder=await o.isKeyHolder(this.cleanDomainName,this.address),this.isKeyHolder?this.showBuySellButtons=!0:await o.getDomainHolder(this.cleanDomainName)===T?this.domainNotExists=!0:(this.showBuySellButtons=!0,this.buyKeyToChat=!0),this.waitingData=!1},async sellKey(){this.waitingSell=!0,this.cleanDomainName=this.clean(this.domainName);const e=new m(["function isKeyHolder(string memory domainName, address user) external view returns (bool)","function sellKeys(string memory domainName, uint256 amount, address referrer) external payable"]),o=new h(this.$config.keysAddress,e,this.signer);try{const l=await o.sellKeys(this.cleanDomainName,1,k(window)),i=this.toast({component:w,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),t=await l.wait();t.status===1?(this.toast.dismiss(i),this.toast(this.cleanDomainName+this.$config.tldName+" friend key has been successfully sold!",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),document.getElementById("closeSellKeyModal").click(),this.isKeyHolder=!1,this.waitingSell=!1,this.isKeyHolder=await o.isKeyHolder(this.cleanDomainName,this.address)):(this.toast.dismiss(i),this.waitingSell=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+l.hash,"_blank").focus()}),console.log(t))}catch(l){console.error(l);try{let i=l.message.split("reason=")[1];i=i.split(", method=")[0],i=i.replace(/"/g,""),i=i.replace("execution reverted:","Error:"),console.log(i),this.toast(i,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waitingSell=!1}}},setup(){const{address:e,chainId:o,isActivated:l,signer:i}=W(),t=M();return{address:e,chainId:o,isActivated:l,signer:i,toast:t}},watch:{domainName:function(e){this.cleanDomainName=null,this.isKeyHolder=!1,this.showBuySellButtons=!1,this.domainNotExists=!1,this.buyKeyToChat=!1,this.buyKeyPriceWei=null,this.sellKeyPriceWei=null},getQueryUsername:function(e){this.domainName=e}}},R={class:"card border"},J={class:"card-body"},O=s("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),Z=[O],z=s("h3",{class:"mb-2 mt-3 text-center"},"Get a Friend Key and unlock a chat room",-1),X={class:"d-flex justify-content-center"},Y={class:"col-12 col-lg-8"},$=s("p",{class:"text-break text-center mt-3 mb-4"}," Search for a domain and get its Friend Key to unlock a chat room with the domain holder and other key holders. ",-1),ee={class:"input-group"},te={key:0,class:"d-flex justify-content-center mt-4"},se={key:1,class:"d-flex justify-content-center mt-4"},ie=["disabled"],oe={key:0,class:"spinner-border spinner-border-sm me-2",role:"status","aria-hidden":"true"},ne={key:1},ae={key:2},le={key:2,class:"d-flex justify-content-center mt-4 mb-4"},re=["disabled"],ce={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"},de=["disabled"],ue={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"},me={key:0,class:"card border mt-3 scroll-500"},he={class:"card-body"},ye=s("h3",{class:"mb-4 mt-3 text-center"},"Featured Keys List",-1),fe={class:"d-flex justify-content-center"},be={class:"col-12 col-lg-8"},pe={key:1,class:"card border mt-3 scroll-500"},ge={class:"card-body"},_e=s("h3",{class:"mb-2 mt-3 text-center"},"This domain does not exist.",-1),we={class:"d-flex justify-content-center"},ke={class:"col-12 col-lg-8"},Ke={class:"text-break mt-3 mb-4"},Ne={key:2,class:"card border mt-3 scroll-500"},xe=L('<div class="card-body"><h3 class="mb-2 mt-3 text-center">Buy a key to see the chat</h3><div class="d-flex justify-content-center"><div class="col-12 col-lg-8"><p class="text-break text-center mt-3 mb-4"> The chat is open only for key holders. Buy a key to see the chat and talk with the domain holder and other key holders. </p></div></div></div>',1),Be=[xe],Ce={class:"modal fade",id:"buyKeyModal",tabindex:"-1","aria-labelledby":"buyKeyModalLabel","aria-hidden":"true"},ve={class:"modal-dialog"},De={class:"modal-content"},Se={class:"modal-header"},Pe={class:"modal-title fs-5",id:"buyKeyModalLabel"},Fe=s("button",{id:"closeBuyKeyModal",type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,-1),We={class:"modal-body"},He={class:"modal-footer"},Te=["disabled"],Me={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"},Ee={class:"modal fade",id:"sellKeyModal",tabindex:"-1","aria-labelledby":"sellKeyModalLabel","aria-hidden":"true"},Ae={class:"modal-dialog"},Ie={class:"modal-content"},Ue={class:"modal-header"},Le={class:"modal-title fs-5",id:"sellKeyModalLabel"},je=s("button",{id:"closeSellKeyModal",type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,-1),Ve={class:"modal-body"},Qe={class:"modal-footer"},qe=["disabled"],Ge={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"};function Re(e,o,l,i,t,n){const K=P,N=F,x=S,B=b("ConnectWalletButton"),C=b("SwitchChainButton"),v=b("KeysList"),D=b("ChatFeed");return r(),u(U,null,[y(x,null,{default:_(()=>[y(K,null,{default:_(()=>[f("Friend Keys | "+a(e.$config.projectMetadataTitle),1)]),_:1}),y(N,{property:"og:title",content:"Friend Keys | "+e.$config.projectMetadataTitle},null,8,["content"])]),_:1}),s("div",R,[s("div",J,[s("p",{class:"fs-3",onClick:o[0]||(o[0]=c=>e.$router.back())},Z),z,s("div",X,[s("div",Y,[$,s("div",ee,[E(s("input",{"onUpdate:modelValue":o[1]||(o[1]=c=>t.domainName=c),type:"text",placeholder:"Enter domain name",class:"form-control",onKeyup:o[2]||(o[2]=I((...c)=>n.getData&&n.getData(...c),["enter"]))},null,544),[[A,t.domainName]]),s("button",{onClick:o[3]||(o[3]=(...c)=>n.getData&&n.getData(...c)),class:"btn btn-primary",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},a(e.$config.tldName),1)]),!i.isActivated||!n.isSupportedChain?(r(),u("div",te,[i.isActivated?d("",!0):(r(),g(B,{key:0,class:"btn btn-outline-primary",btnText:"Connect wallet"})),i.isActivated&&!n.isSupportedChain?(r(),g(C,{key:1})):d("",!0)])):d("",!0),i.isActivated&&n.isSupportedChain&&!t.showBuySellButtons?(r(),u("div",se,[s("button",{disabled:t.waitingData||!t.domainName,class:"btn btn-outline-primary",type:"button",onClick:o[4]||(o[4]=(...c)=>n.getData&&n.getData(...c))},[t.waitingData?(r(),u("span",oe)):d("",!0),t.domainName?d("",!0):(r(),u("span",ne,"Unlock Chat")),t.domainName?(r(),u("span",ae,"Unlock "+a(t.domainName)+"'s Chat",1)):d("",!0)],8,ie)])):d("",!0),i.isActivated&&n.isSupportedChain&&t.showBuySellButtons&&!t.domainNotExists?(r(),u("div",le,[s("button",{disabled:t.waitingBuy||!t.domainName,class:"btn btn-outline-primary",type:"button",onClick:o[5]||(o[5]=(...c)=>n.fetchBuyData&&n.fetchBuyData(...c)),"data-bs-toggle":"modal","data-bs-target":"#buyKeyModal"},[t.waitingBuy?(r(),u("span",ce)):d("",!0),f(" Buy Key ")],8,re),s("button",{disabled:t.waitingSell||!t.domainName,class:"btn btn-outline-primary ms-3",type:"button",onClick:o[6]||(o[6]=(...c)=>n.fetchSellData&&n.fetchSellData(...c)),"data-bs-toggle":"modal","data-bs-target":"#sellKeyModal"},[t.waitingSell?(r(),u("span",ue)):d("",!0),f(" Sell Key ")],8,de)])):d("",!0)])])])]),!t.domainNotExists&&!t.showBuySellButtons&&!t.buyKeyToChat&&!t.isKeyHolder?(r(),u("div",me,[s("div",he,[ye,s("div",fe,[s("div",be,[y(v)])])])])):d("",!0),t.domainNotExists&&!t.showBuySellButtons?(r(),u("div",pe,[s("div",ge,[_e,s("div",we,[s("div",ke,[s("div",Ke,[f(" Instead, try one of these: "),s("ul",null,[s("li",null,"techie"+a(e.$config.tldName),1),s("li",null,"tekr"+a(e.$config.tldName),1)])])])])])])):d("",!0),t.buyKeyToChat?(r(),u("div",Ne,Be)):d("",!0),t.domainName&&t.cleanDomainName&&t.isKeyHolder&&!t.waitingData&&n.clean(t.domainName)===t.cleanDomainName?(r(),g(D,{key:t.cleanDomainName,class:"mt-3",showQuotedPost:e.$config.showRepliesOnHomepage,orbisContext:e.$config.chatChannels.friendKeys+":"+t.cleanDomainName},null,8,["showQuotedPost","orbisContext"])):d("",!0),s("div",Ce,[s("div",ve,[s("div",De,[s("div",Se,[s("h1",Pe,"Buy one "+a(t.cleanDomainName)+a(e.$config.tldName)+" key",1),Fe]),s("div",We," Buy 1 "+a(t.cleanDomainName)+a(e.$config.tldName)+" key for "+a(n.buyKeyPrice)+" "+a(e.$config.tokenSymbol)+"? ",1),s("div",He,[s("button",{type:"button",class:"btn btn-primary",onClick:o[7]||(o[7]=(...c)=>n.buyKey&&n.buyKey(...c)),disabled:t.waitingBuy},[t.waitingBuy?(r(),u("span",Me)):d("",!0),s("span",null,"Buy for "+a(n.buyKeyPrice)+" "+a(e.$config.tokenSymbol),1)],8,Te)])])])]),s("div",Ee,[s("div",Ae,[s("div",Ie,[s("div",Ue,[s("h1",Le," Sell one "+a(t.cleanDomainName)+a(e.$config.tldName)+" key ",1),je]),s("div",Ve," Sell 1 "+a(t.cleanDomainName)+a(e.$config.tldName)+" key for "+a(n.sellKeyPrice)+" "+a(e.$config.tokenSymbol)+"? ",1),s("div",Qe,[s("button",{type:"button",class:"btn btn-primary",onClick:o[8]||(o[8]=(...c)=>n.sellKey&&n.sellKey(...c)),disabled:t.waitingSell},[t.waitingSell?(r(),u("span",Ge)):d("",!0),s("span",null,"Sell for "+a(n.sellKeyPrice)+" "+a(e.$config.tokenSymbol),1)],8,qe)])])])])],64)}const mt=H(G,[["render",Re]]);export{mt as default};