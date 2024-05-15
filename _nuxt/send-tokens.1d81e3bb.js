import{H as R,T as E,M as N}from"./components.fa4f4b6a.js";import{t as M}from"./tokens.8eeff16c.js";import{u as L}from"./ethers.1b35c37b.js";import{a as I,a9 as U,I as W,G as k,J as y,Z as w,K as V,r as b,o as c,b as l,f as n,l as u,L as f,M as T,i as g,t as d,F as S,P as F,c as C,e as p,w as B}from"./entry.f8784ff1.js";import{a as H,E as x}from"./balanceUtils.5a833363.js";import{h as v}from"./textUtils.a412895c.js";import{W as A}from"./WaitingToast.dc7aac74.js";import{C as P}from"./ConnectWalletButton.d49238f7.js";import{S as j}from"./SwitchChainButton.a8bf1ed7.js";import"./composables.d8cc695a.js";const D={name:"SendTokensComponent",props:["recipient","tokens"],data(){return{filterTextInput:"",hasBlankCharacter:!1,inputReceiver:null,inputToken:null,inputTokenAmount:null,inputTokenBalance:null,recipientAddress:null,tokenList:[],waiting:!1}},components:{ConnectWalletButton:P,SwitchChainButton:j},mounted(){this.inputReceiver=this.recipient,this.processRecipient(this.recipient),this.findBlankCharacter(),this.tokenList=this.tokens.tokens,this.selectInputToken(this.tokenList[0])},computed:{filteredTokensInput(){const e=new RegExp(this.filterTextInput,"i");return this.tokenList.filter(t=>e.test(t.symbol))},formatInputTokenBalance(){return this.inputTokenBalance?this.inputTokenBalance==0?0:this.inputTokenBalance>100?Number(this.inputTokenBalance).toFixed(2):Number(this.inputTokenBalance).toFixed(4):0},inputAmountLessThanBalance(){return this.inputTokenAmount&&this.inputTokenBalance?Number(this.inputTokenAmount)<=Number(this.inputTokenBalance):!1},isSupportedChain(){return this.chainId==this.$config.supportedChainId}},methods:{getTokenBalance:H,hasTextBlankCharacters:v,findBlankCharacter(){this.hasBlankCharacter=!1,this.hasBlankCharacter=v(this.inputReceiver)},async processRecipient(e){if(e)if(U(e))this.recipientAddress=e;else{const t=String(e).trim().toLowerCase().replace(this.$config.tldName,"");let i=this.$getFallbackProvider(this.$config.supportedChainId);this.isActivated&&this.chainId===this.$config.supportedChainId&&(i=this.signer);const r=new W(["function getDomainHolder(string) view returns (address)"]),s=new k(this.$config.punkTldAddress,r,i);this.recipientAddress=await s.getDomainHolder(t)}},async selectInputToken(e){this.inputToken=e,this.inputTokenAmount=null,this.signer&&(this.inputTokenBalance=await this.getTokenBalance(e,this.address,this.signer))},async send(){if(this.inputReceiver.includes(".")&&!this.inputReceiver.endsWith(this.$config.tldName))return this.toast.error("Invalid domain name. Only "+this.$config.tldName+" domains are supported.");if(this.waiting=!0,await this.processRecipient(this.inputReceiver),this.recipientAddress==y)return this.waiting=!1,this.toast.error("This domain name does not exist");this.inputToken.address==y?this.sendNativeCoin():this.sendErc20Tokens()},async sendErc20Tokens(){const e=new k(this.inputToken.address,x,this.signer);try{const t=await e.transfer(this.recipientAddress,w(this.inputTokenAmount,this.inputToken.decimals)),i=this.toast({component:A,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+t.hash,"_blank").focus()}),r=await t.wait();r.status===1?(this.toast.dismiss(i),this.toast("You have successfully sent "+String(this.inputTokenAmount)+" "+this.inputToken.symbol+" to "+this.inputReceiver,{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+t.hash,"_blank").focus()}),this.subtractInputTokenBalance(),this.waiting=!1):(this.toast.dismiss(i),this.waiting=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+t.hash,"_blank").focus()}),console.log(r))}catch(t){console.error(t);try{let i=t.message.split("reason=")[1];i=i.split(", method=")[0],i=i.replace(/"/g,""),i=i.replace("execution reverted:","Error:"),console.log(i),this.toast(i,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waiting=!1}},async sendNativeCoin(){new k(this.inputToken.address,x,this.signer);try{const e=await this.signer.sendTransaction({to:this.recipientAddress,value:w(this.inputTokenAmount,this.inputToken.decimals)}),t=this.toast({component:A,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+e.hash,"_blank").focus()}),i=await e.wait();i.status===1?(this.toast.dismiss(t),this.toast("You have successfully sent "+String(this.inputTokenAmount)+" "+this.inputToken.symbol+" to "+this.inputReceiver,{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+e.hash,"_blank").focus()}),this.subtractInputTokenBalance(),this.waiting=!1):(this.toast.dismiss(t),this.waiting=!1,this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+e.hash,"_blank").focus()}),console.log(i))}catch(e){console.error(e);try{let t=e.message.split("reason=")[1];t=t.split(", method=")[0],t=t.replace(/"/g,""),t=t.replace("execution reverted:","Error:"),console.log(t),this.toast(t,{type:"error"})}catch{this.toast("Transaction has failed.",{type:"error"})}this.waiting=!1}},setMaxInputTokenAmount(){this.inputTokenAmount=String(this.inputTokenBalance)},subtractInputTokenBalance(){this.inputTokenBalance=Number(this.inputTokenBalance)-Number(this.inputTokenAmount)}},setup(){const{address:e,chainId:t,isActivated:i,signer:r}=L(),s=V();return{address:e,chainId:t,isActivated:i,signer:r,toast:s}},watch:{async isActivated(){this.address&&(this.inputTokenBalance=await this.getTokenBalance(this.inputToken,this.address,this.signer))}}},q={class:"mb-3"},K={class:"input-group"},Q={key:0,class:"input-group-text",id:"basic-addon3"},Y=n("i",{class:"bi bi-exclamation-triangle-fill"},null,-1),Z=[Y],G={key:0,class:"form-text",id:"basic-addon4"},J=n("i",{class:"bi bi-exclamation-triangle-fill"},null,-1),O={class:"input-group mb-1 mt-3"},X={class:"btn btn-primary dropdown-toggle",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},z={class:"dropdown-menu p-2"},$=["onClick"],tt=n("small",null,"MAX",-1),et=[tt],nt=n("em",null,"Balance: ",-1),st={class:"cursor-pointer hover-color"},it={class:"d-flex justify-content-center mt-4"},ot={key:1,disabled:!0,class:"btn btn-outline-primary",type:"button"},at=["disabled"],rt={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"},ct={key:3,disabled:!0,class:"btn btn-outline-primary",type:"button"};function lt(e,t,i,r,s,o){const h=b("ConnectWalletButton"),m=b("SwitchChainButton");return c(),l("div",null,[n("div",q,[n("div",K,[s.hasBlankCharacter?(c(),l("span",Q,Z)):u("",!0),f(n("input",{"onUpdate:modelValue":t[0]||(t[0]=a=>s.inputReceiver=a),type:"text",class:"form-control",id:"basic-url","aria-describedby":"basic-addon3 basic-addon4",placeholder:"Enter recipient's domain name or address",onKeyup:t[1]||(t[1]=(...a)=>o.findBlankCharacter&&o.findBlankCharacter(...a))},null,544),[[T,s.inputReceiver]])]),s.hasBlankCharacter?(c(),l("div",G,[J,g(" This domain name contains a blank character: "+d(encodeURIComponent(s.inputReceiver))+". Proceed with caution. ",1)])):u("",!0)]),n("div",O,[n("button",X,d(s.inputToken?.symbol),1),n("ul",z,[f(n("input",{class:"form-control mb-2",placeholder:"Filter tokens","onUpdate:modelValue":t[2]||(t[2]=a=>s.filterTextInput=a)},null,512),[[T,s.filterTextInput]]),(c(!0),l(S,null,F(o.filteredTokensInput,a=>(c(),l("li",{key:a.address,class:"cursor-pointer"},[n("span",{onClick:_=>o.selectInputToken(a),class:"dropdown-item"},d(a.symbol)+" ("+d(a.name)+")",9,$)]))),128))]),f(n("input",{"onUpdate:modelValue":t[3]||(t[3]=a=>s.inputTokenAmount=a),type:"text",class:"form-control",placeholder:"0.00"},null,512),[[T,s.inputTokenAmount]]),n("button",{onClick:t[4]||(t[4]=(...a)=>o.setMaxInputTokenAmount&&o.setMaxInputTokenAmount(...a)),class:"btn btn-outline-secondary",type:"button",id:"button-addon2"},et)]),n("small",{onClick:t[5]||(t[5]=(...a)=>o.setMaxInputTokenAmount&&o.setMaxInputTokenAmount(...a))},[nt,n("em",st,d(o.formatInputTokenBalance)+" "+d(s.inputToken?.symbol),1)]),n("div",it,[r.isActivated?u("",!0):(c(),C(h,{key:0,class:"btn btn-outline-primary",btnText:"Connect wallet"})),r.isActivated&&!s.inputTokenAmount&&o.isSupportedChain?(c(),l("button",ot," Send tokens ")):u("",!0),r.isActivated&&s.inputTokenAmount&&o.inputAmountLessThanBalance&&o.isSupportedChain?(c(),l("button",{key:2,disabled:s.waiting||!s.inputToken||!s.inputTokenAmount||!r.isActivated||!o.inputAmountLessThanBalance||!s.inputReceiver||!o.isSupportedChain,class:"btn btn-outline-primary",type:"button",onClick:t[6]||(t[6]=(...a)=>o.send&&o.send(...a))},[s.waiting?(c(),l("span",rt)):u("",!0),g(" Send tokens ")],8,at)):u("",!0),r.isActivated&&s.inputTokenAmount&&!o.inputAmountLessThanBalance&&o.isSupportedChain?(c(),l("button",ct," Balance too low ")):u("",!0),r.isActivated&&!o.isSupportedChain?(c(),C(m,{key:4})):u("",!0)])])}const ut=I(D,[["render",lt]]),dt={name:"SendTokens",components:{SendTokensComponent:ut},computed:{getQueryRecipient(){return this.$route.query.to?this.$route.query.to:null}},setup(){return{tokens:M}}},pt={class:"scroll-500"},ht={class:"card border"},mt={class:"card-body mb-3"},kt={class:"fs-3"},ft=n("h3",{class:"mt-3"},"Send tokens",-1),Tt={class:"d-flex justify-content-center mt-5"},bt={class:"col-12 col-lg-8"};function gt(e,t,i,r,s,o){const h=E,m=N,a=R,_=b("SendTokensComponent");return c(),l(S,null,[p(a,null,{default:B(()=>[p(h,null,{default:B(()=>[g("Send tokens | "+d(e.$config.projectMetadataTitle),1)]),_:1}),p(m,{property:"og:title",content:"Send tokens | "+e.$config.projectMetadataTitle},null,8,["content"])]),_:1}),n("div",pt,[n("div",ht,[n("div",mt,[n("p",kt,[n("i",{class:"bi bi-arrow-left-circle cursor-pointer",onClick:t[0]||(t[0]=_t=>e.$router.back())})]),ft,n("div",Tt,[n("div",bt,[p(_,{tokens:r.tokens,recipient:o.getQueryRecipient},null,8,["tokens","recipient"])])])])])])],64)}const Et=I(dt,[["render",gt]]);export{Et as default};
