import{H as C,T as D,M as S}from"./components.d49b8c75.js";import{a as P,p as b,I as u,C as y,A as F,l as W,v as H,b as m,e as h,w as p,f as s,x as T,y as E,E as M,t as n,c as _,z as d,i as f,F as A,r as g,o as c,h as I}from"./entry.105ba511.js";import{W as w}from"./WaitingToast.14fe0056.js";import{C as j}from"./ChatFeed.dc8ef359.js";import{K as L}from"./KeysList.ccd5cb31.js";import{C as U}from"./ConnectWalletButton.476a27da.js";import{f as V}from"./storageUtils.1585f53a.js";import"./composables.fef2a4d3.js";import"./ChatPost.50a5d25f.js";import"./user.fcf053d9.js";import"./domainUtils.93e405fe.js";import"./textUtils.7243e6a3.js";import"./MintedPostImage.159ce568.js";import"./site.7b9cc079.js";import"./SwitchChainButton.7b82e267.js";import"./FileUploadModal.5a259a19.js";const Q={name:"Keys",data(){return{buyKeyPriceWei:null,buyKeyToChat:!1,cleanDomainName:null,domainName:null,domainNotExists:!1,isKeyHolder:!1,sellKeyPriceWei:null,showBuySellButtons:!1,waitingBuy:!1,waitingData:!1,waitingSell:!1}},components:{ChatFeed:j,ConnectWalletButton:U,KeysList:L},computed:{buyKeyPrice(){if(this.buyKeyPriceWei){const e=Number(b(this.buyKeyPriceWei));return e>1?e.toFixed(2):e>.1?e.toFixed(4):e>.01?e.toFixed(5):e>.001?e.toFixed(6):e>1e-4?e.toFixed(7):e>1e-5?e.toFixed(8):e>1e-6?e.toFixed(9):e}return null},sellKeyPrice(){if(this.sellKeyPriceWei){const e=Number(b(this.sellKeyPriceWei));return e>1?e.toFixed(2):e>.1?e.toFixed(4):e>.01?e.toFixed(5):e>.001?e.toFixed(6):e>1e-4?e.toFixed(7):e>1e-5?e.toFixed(8):e>1e-6?e.toFixed(9):e}return null}},methods:{async buyKey(){this.waitingBuy=!0,this.cleanDomainName=this.clean(this.domainName);const e=new u(["function buyKeys(string memory domainName, uint256 amount, address referrer) external payable"]),i=new y(this.$config.keysAddress,e,this.signer);try{const a=await i.buyKeys(this.cleanDomainName,1,V(window),{value:this.buyKeyPriceWei}),o=this.toast({component:w,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),t=await a.wait();t.status===1?(this.toast.dismiss(o),this.toast(this.cleanDomainName+this.$config.tldName+" friend key has been successfully claimed! Now you can chat.",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),document.getElementById("closeBuyKeyModal").click(),this.isKeyHolder=!0,this.buyKeyToChat=!1,this.waitingBuy=!1):(this.toast.dismiss(o),this.waitingBuy=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),console.log(t))}catch(a){console.error(a);try{let o=a.message.split("reason=")[1];o=o.split(", method=")[0],o=o.replace(/"/g,""),o=o.replace("execution reverted:","Error:"),console.log(o),this.toast(o,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waitingBuy=!1}},clean(e){return e.split(".")[0].trim().toLowerCase()},async fetchBuyData(){this.buyKeyPriceWei=null,this.waitingBuy=!0;const e=new u(["function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"]),i=new y(this.$config.keysAddress,e,this.signer);this.buyKeyPriceWei=await i.getBuyPriceAfterFee(this.cleanDomainName,1),this.waitingBuy=!1},async fetchSellData(){this.sellKeyPriceWei=null,this.waitingSell=!0;const e=new u(["function getSellPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)"]),i=new y(this.$config.keysAddress,e,this.signer);this.sellKeyPriceWei=await i.getSellPriceAfterFee(this.cleanDomainName,1),console.log("sellKeyPriceWei",this.sellKeyPriceWei),console.log("sellKeyPrice",b(this.sellKeyPriceWei)),this.waitingSell=!1},async getData(){this.cleanDomainName=null,this.isKeyHolder=!1,this.waitingData=!0,this.cleanDomainName=this.clean(this.domainName);const e=new u(["function getBuyPriceAfterFee(string memory domainName, uint256 amount) public view returns (uint256)","function getDomainHolder(string memory domainName) external view returns (address)","function isKeyHolder(string memory domainName, address user) external view returns (bool)"]),i=new y(this.$config.keysAddress,e,this.signer);this.isKeyHolder=await i.isKeyHolder(this.cleanDomainName,this.address),this.isKeyHolder?this.showBuySellButtons=!0:await i.getDomainHolder(this.cleanDomainName)===F?this.domainNotExists=!0:(this.showBuySellButtons=!0,this.buyKeyToChat=!0),this.waitingData=!1},async sellKey(){this.waitingSell=!0,this.cleanDomainName=this.clean(this.domainName);const e=new u(["function isKeyHolder(string memory domainName, address user) external view returns (bool)","function sellKeys(string memory domainName, uint256 amount) external payable"]),i=new y(this.$config.keysAddress,e,this.signer);try{const a=await i.sellKeys(this.cleanDomainName,1),o=this.toast({component:w,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),t=await a.wait();t.status===1?(this.toast.dismiss(o),this.toast(this.cleanDomainName+this.$config.tldName+" friend key has been successfully sold!",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),document.getElementById("closeSellKeyModal").click(),this.isKeyHolder=!1,this.waitingSell=!1,this.isKeyHolder=await i.isKeyHolder(this.cleanDomainName,this.address)):(this.toast.dismiss(o),this.waitingSell=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),console.log(t))}catch(a){console.error(a);try{let o=a.message.split("reason=")[1];o=o.split(", method=")[0],o=o.replace(/"/g,""),o=o.replace("execution reverted:","Error:"),console.log(o),this.toast(o,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waitingSell=!1}}},setup(){const{address:e,isActivated:i,signer:a}=W(),o=H();return{address:e,isActivated:i,signer:a,toast:o}},watch:{domainName:function(e){this.cleanDomainName=null,this.isKeyHolder=!1,this.showBuySellButtons=!1,this.domainNotExists=!1,this.buyKeyToChat=!1,this.buyKeyPriceWei=null,this.sellKeyPriceWei=null}}},R={class:"card border"},z={class:"card-body"},G=s("i",{class:"bi bi-arrow-left-circle cursor-pointer"},null,-1),O=[G],Z=s("h3",{class:"mb-2 mt-3 text-center"},"Get a Friend Key and unlock a chat room",-1),q={class:"d-flex justify-content-center"},J={class:"col-12 col-lg-8"},X=s("p",{class:"text-break text-center mt-3 mb-4"}," Search for a domain and get its Friend Key to unlock a chat room with the domain holder and other key holders. ",-1),Y={class:"input-group"},$={key:0,class:"d-flex justify-content-center mt-4"},ee={key:1,class:"d-flex justify-content-center mt-4"},te=["disabled"],se={key:0,class:"spinner-border spinner-border-sm me-2",role:"status","aria-hidden":"true"},ie={key:1},oe={key:2},ne={key:2,class:"d-flex justify-content-center mt-4 mb-4"},ae=["disabled"],le={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"},re=["disabled"],ce={key:0,class:"spinner-border spinner-border-sm",role:"status","aria-hidden":"true"},de={key:0,class:"card border mt-3 scroll-500"},me={class:"card-body"},ue=s("h3",{class:"mb-4 mt-3 text-center"},"Featured Keys List",-1),ye={class:"d-flex justify-content-center"},he={class:"col-12 col-lg-8"},fe={key:1,class:"card border mt-3 scroll-500"},be={class:"card-body"},ge=s("h3",{class:"mb-2 mt-3 text-center"},"This domain does not exist.",-1),pe={class:"d-flex justify-content-center"},_e={class:"col-12 col-lg-8"},we={class:"text-break mt-3 mb-4"},ke={key:2,class:"card border mt-3 scroll-500"},Ke=I('<div class="card-body"><h3 class="mb-2 mt-3 text-center">Buy a key to see the chat</h3><div class="d-flex justify-content-center"><div class="col-12 col-lg-8"><p class="text-break text-center mt-3 mb-4"> The chat is open only for key holders. Buy a key to see the chat and talk with the domain holder and other key holders. </p></div></div></div>',1),Ne=[Ke],xe={class:"modal fade",id:"buyKeyModal",tabindex:"-1","aria-labelledby":"buyKeyModalLabel","aria-hidden":"true"},Be={class:"modal-dialog"},ve={class:"modal-content"},Ce={class:"modal-header"},De={class:"modal-title fs-5",id:"buyKeyModalLabel"},Se=s("button",{id:"closeBuyKeyModal",type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,-1),Pe={class:"modal-body"},Fe={class:"modal-footer"},We=["disabled"],He={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"},Te={class:"modal fade",id:"sellKeyModal",tabindex:"-1","aria-labelledby":"sellKeyModalLabel","aria-hidden":"true"},Ee={class:"modal-dialog"},Me={class:"modal-content"},Ae={class:"modal-header"},Ie={class:"modal-title fs-5",id:"sellKeyModalLabel"},je=s("button",{id:"closeSellKeyModal",type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,-1),Le={class:"modal-body"},Ue={class:"modal-footer"},Ve=["disabled"],Qe={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"};function Re(e,i,a,o,t,l){const k=D,K=S,N=C,x=g("ConnectWalletButton"),B=g("KeysList"),v=g("ChatFeed");return c(),m(A,null,[h(N,null,{default:p(()=>[h(k,null,{default:p(()=>[f("Friend Keys | "+n(e.$config.projectMetadataTitle),1)]),_:1}),h(K,{property:"og:title",content:"Friend Keys | "+e.$config.projectMetadataTitle},null,8,["content"])]),_:1}),s("div",R,[s("div",z,[s("p",{class:"fs-3",onClick:i[0]||(i[0]=r=>e.$router.back())},O),Z,s("div",q,[s("div",J,[X,s("div",Y,[T(s("input",{"onUpdate:modelValue":i[1]||(i[1]=r=>t.domainName=r),type:"text",placeholder:"Enter domain name",class:"form-control",onKeyup:i[2]||(i[2]=M((...r)=>l.getData&&l.getData(...r),["enter"]))},null,544),[[E,t.domainName]]),s("button",{onClick:i[3]||(i[3]=(...r)=>l.getData&&l.getData(...r)),class:"btn btn-primary",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},n(e.$config.tldName),1)]),o.isActivated?d("",!0):(c(),m("div",$,[o.isActivated?d("",!0):(c(),_(x,{key:0,class:"btn btn-outline-primary",btnText:"Connect wallet"}))])),o.isActivated&&!t.showBuySellButtons?(c(),m("div",ee,[s("button",{disabled:t.waitingData||!t.domainName,class:"btn btn-outline-primary",type:"button",onClick:i[4]||(i[4]=(...r)=>l.getData&&l.getData(...r))},[t.waitingData?(c(),m("span",se)):d("",!0),t.domainName?d("",!0):(c(),m("span",ie,"Unlock Chat")),t.domainName?(c(),m("span",oe,"Unlock "+n(t.domainName)+"'s Chat",1)):d("",!0)],8,te)])):d("",!0),o.isActivated&&t.showBuySellButtons&&!t.domainNotExists?(c(),m("div",ne,[s("button",{disabled:t.waitingBuy||!t.domainName,class:"btn btn-outline-primary",type:"button",onClick:i[5]||(i[5]=(...r)=>l.fetchBuyData&&l.fetchBuyData(...r)),"data-bs-toggle":"modal","data-bs-target":"#buyKeyModal"},[t.waitingBuy?(c(),m("span",le)):d("",!0),f(" Buy Key ")],8,ae),s("button",{disabled:t.waitingSell||!t.domainName,class:"btn btn-outline-primary ms-3",type:"button",onClick:i[6]||(i[6]=(...r)=>l.fetchSellData&&l.fetchSellData(...r)),"data-bs-toggle":"modal","data-bs-target":"#sellKeyModal"},[t.waitingSell?(c(),m("span",ce)):d("",!0),f(" Sell Key ")],8,re)])):d("",!0)])])])]),!t.domainNotExists&&!t.showBuySellButtons&&!t.buyKeyToChat&&!t.isKeyHolder?(c(),m("div",de,[s("div",me,[ue,s("div",ye,[s("div",he,[h(B)])])])])):d("",!0),t.domainNotExists&&!t.showBuySellButtons?(c(),m("div",fe,[s("div",be,[ge,s("div",pe,[s("div",_e,[s("p",we,[f(" Instead, try one of these: "),s("ul",null,[s("li",null,"techie"+n(e.$config.tldName),1),s("li",null,"tekr"+n(e.$config.tldName),1)])])])])])])):d("",!0),t.buyKeyToChat?(c(),m("div",ke,Ne)):d("",!0),t.domainName&&t.cleanDomainName&&t.isKeyHolder&&!t.waitingData&&l.clean(t.domainName)===t.cleanDomainName?(c(),_(v,{key:t.cleanDomainName,class:"mt-3",showQuotedPost:e.$config.showRepliesOnHomepage,orbisContext:e.$config.chatChannels.friendKeys+":"+t.cleanDomainName},null,8,["showQuotedPost","orbisContext"])):d("",!0),s("div",xe,[s("div",Be,[s("div",ve,[s("div",Ce,[s("h1",De,"Buy one "+n(t.cleanDomainName)+n(e.$config.tldName)+" key",1),Se]),s("div",Pe," Buy 1 "+n(t.cleanDomainName)+n(e.$config.tldName)+" key for "+n(l.buyKeyPrice)+" "+n(e.$config.tokenSymbol)+"? ",1),s("div",Fe,[s("button",{type:"button",class:"btn btn-primary",onClick:i[7]||(i[7]=(...r)=>l.buyKey&&l.buyKey(...r)),disabled:t.waitingBuy},[t.waitingBuy?(c(),m("span",He)):d("",!0),s("span",null,"Buy for "+n(l.buyKeyPrice)+" "+n(e.$config.tokenSymbol),1)],8,We)])])])]),s("div",Te,[s("div",Ee,[s("div",Me,[s("div",Ae,[s("h1",Ie,"Sell one "+n(t.cleanDomainName)+n(e.$config.tldName)+" key",1),je]),s("div",Le," Sell 1 "+n(t.cleanDomainName)+n(e.$config.tldName)+" key for "+n(l.sellKeyPrice)+" "+n(e.$config.tokenSymbol)+"? ",1),s("div",Ue,[s("button",{type:"button",class:"btn btn-primary",onClick:i[8]||(i[8]=(...r)=>l.sellKey&&l.sellKey(...r)),disabled:t.waitingSell},[t.waitingSell?(c(),m("span",Qe)):d("",!0),s("span",null,"Sell for "+n(l.sellKeyPrice)+" "+n(e.$config.tokenSymbol),1)],8,Ve)])])])])],64)}const lt=P(Q,[["render",Re]]);export{lt as default};