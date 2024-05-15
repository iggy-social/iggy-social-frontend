import{u as W}from"./ethers.1b35c37b.js";import{E as Y,b as K,a as Z}from"./balanceUtils.5a833363.js";import{E as N,G as v,Z as x,J as d,I as j,a as O,K as P,o as r,b as c,f as n,t as l,i as D,L as I,M as S,l as h,H as G,ar as J,r as C,F as M,P as F,c as U,e as H}from"./entry.f8784ff1.js";import{u as E}from"./site.c2a68d77.js";import{C as X}from"./ConnectWalletButton.d49238f7.js";import{S as q}from"./SwitchChainButton.a8bf1ed7.js";import{W as B}from"./WaitingToast.dc7aac74.js";const f={1:"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",10:"0x4200000000000000000000000000000000000006",14:"0x1d80c49bbbcd1c0911346656b529df9e5c2f783d",19:"0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED",56:"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",100:"0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",137:"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",250:"0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",324:"0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",1101:"0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9",42161:"0x82af49447d8a07e3bd95bd0d56f35241523fbab1",43114:"0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",11155111:"0xf531B8F309Be94191af87605CfBf600D71C2cFe0"};async function z(s,e,i,a,o){const t=N();let p=s;p||(p=this.$getFallbackProvider(t.supportedChainId));const m=["function getPriceImpact(address tokenIn, address tokenOut, uint amountIn) external view returns (uint)"],w=new v(o,m,p),k=x(a,e.decimals),u=await w.getPriceImpact(e.address,i.address,k);return Number(u)}async function Q(s,e,i,a,o){const t=N();let p=s;p||(p=this.$getFallbackProvider(t.supportedChainId));const m=x(a,e.decimals);let w=[e.address,i.address];const k=f[String(t.supportedChainId)];if(e.address!==d&&e.address!==k&&i.address!==d&&i.address!==k&&(w=[e.address,k,i.address]),(e.address===d||e.address===k)&&(i.address===d||i.address===k))return m;const u=["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],T=await new v(o,u,p).getAmountsOut(m,w);return T[T.length-1]}function $(s,e,i,a,o,t,p,m){const w=N(),k=E();let u=s;const b=Math.floor(Date.now()/1e3)+60*Number(k.getSwapDeadline),T=String(f[String(w.supportedChainId)]).toLowerCase(),g=String(i.address).toLowerCase(),A=String(a.address).toLowerCase(),R=new j(["function deposit() payable","function withdraw(uint wad)"]),L=new v(T,R,u);if(g===d&&A===T)return L.deposit({value:o});if(g===T&&A===d)return L.withdraw(o);{const V=["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)","function swapExactTokensForTokensWithReferrer(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)","function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)","function swapExactETHForTokensWithReferrer(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)","function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)","function swapExactTokensForETHWithReferrer(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"],y=new v(p,V,u);let _=[g,A];return g===d&&A!==T&&A!==d?m===d?y.swapExactETHForTokens(t,_,e,b,{value:o}):y.swapExactETHForTokensWithReferrer(t,_,e,b,m,{value:o}):g!==d&&g!==T&&A===d?m===d?y.swapExactTokensForETH(o,t,_,e,b):y.swapExactTokensForETHWithReferrer(o,t,_,e,b,m):(g!==T&&A!==T&&(_=[g,T,A]),m===d?y.swapExactTokensForTokens(o,t,_,e,b):y.swapExactTokensForTokensWithReferrer(o,t,_,e,b,m))}}const tt={name:"TokenApprovalModal",props:["amount","modalId","routerAddress","token"],emits:["setApprovalAmount"],components:{WaitingToast:B},data(){return{waiting:!1,selectedOption:"unlimited",approvalAmount:0}},mounted(){this.approvalAmount=this.amount},computed:{isUnlimited(){return this.selectedOption==="unlimited"}},methods:{selectOption(s){this.selectedOption=s},async approveToken(){this.waiting=!0;let s=this.approvalAmount;this.isUnlimited&&(s=1e16);const e=x(String(s),this.token.decimals),i=new v(this.token.address,Y,this.signer);try{const a=await i.approve(this.routerAddress,e),o=this.toast({component:B,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),t=await a.wait();t.status===1?(this.toast.dismiss(o),this.toast("You have successfully approved "+this.token.symbol+"!",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),this.$emit("setApprovalAmount",s),this.waiting=!1,document.getElementById("closeTokenApprovalModal"+this.modalId).click()):(this.waiting=!1,this.toast.dismiss(o),this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+a.hash,"_blank").focus()}),console.log(t))}catch{this.toast.error("Something went wrong while approving the token"),this.waiting=!1;return}this.waiting=!1}},setup(){const{signer:s}=W(),e=P();return{signer:s,toast:e}},watch:{amount(s,e){s&&(this.approvalAmount=this.amount)}}},et=["id","aria-labelledby"],nt={class:"modal-dialog"},ot={class:"modal-content"},st={class:"modal-header"},it=["id"],at=["id"],ut={class:"modal-body"},rt={class:"row mt-3"},lt={class:"col-lg-8"},dt={class:"input-group-text"},ct=["checked"],pt=n("input",{value:"Unlimited",type:"text",class:"form-control",disabled:""},null,-1),ht={class:"input-group-text"},mt=["checked"],kt=["disabled"],Tt={class:"input-group-text",id:"basic-addon2"},bt=n("p",{class:"mt-3"},[n("small",null,[n("em",null," If you want to do more swaps without approvals, set a big enough amount or choose unlimited. ")])],-1),ft={class:"modal-footer"},wt=["disabled"],gt={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"},At={key:1},_t={key:2};function yt(s,e,i,a,o,t){return r(),c("div",{class:"modal fade",id:"tokenApprovalModal"+i.modalId,tabindex:"-1","aria-labelledby":"tokenApprovalModalLabel"+i.modalId,"aria-hidden":"true"},[n("div",nt,[n("div",ot,[n("div",st,[n("h1",{class:"modal-title fs-5",id:"tokenApprovalModalLabel"+i.modalId}," Approve "+l(i.token?.symbol)+" token ",9,it),n("button",{id:"closeTokenApprovalModal"+i.modalId,type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,8,at)]),n("div",ut,[D(" Approve "+l(i.token?.symbol)+" tokens for swapping: ",1),n("div",rt,[n("div",lt,[n("div",{class:"input-group",onClick:e[0]||(e[0]=p=>t.selectOption("unlimited"))},[n("div",dt,[n("input",{class:"form-check-input mt-0",type:"radio",checked:t.isUnlimited},null,8,ct)]),pt]),n("div",{class:"input-group mt-2",onClick:e[2]||(e[2]=p=>t.selectOption("limited"))},[n("div",ht,[n("input",{class:"form-check-input mt-0",type:"radio",checked:!t.isUnlimited},null,8,mt)]),I(n("input",{"onUpdate:modelValue":e[1]||(e[1]=p=>o.approvalAmount=p),type:"text",class:"form-control",disabled:o.waiting},null,8,kt),[[S,o.approvalAmount]]),n("span",Tt,l(i.token?.symbol),1)])])]),bt]),n("div",ft,[n("button",{type:"button",class:"btn btn-primary",onClick:e[3]||(e[3]=(...p)=>t.approveToken&&t.approveToken(...p)),disabled:o.waiting},[o.waiting?(r(),c("span",gt)):h("",!0),t.isUnlimited?(r(),c("span",At,"Approve unlimited")):h("",!0),t.isUnlimited?h("",!0):(r(),c("span",_t,"Approve "+l(o.approvalAmount)+" "+l(i.token?.symbol),1))],8,wt)])])])],8,et)}const vt=O(tt,[["render",yt]]),xt={name:"SwapTokensModal",props:["inputToken","inputTokenAmount","modalId","outputToken","outputTokenAmount","outputTokenAmountWei","routerAddress"],emits:["changeInputTokenBalance"],data(){return{waiting:!1}},components:{WaitingToast:B},computed:{bothTokensAreNativeCoinOrWrappedToken(){return!!(this.inputIsNativeCoin&&this.outputIsWrappedNativeCoin||this.inputIsWrappedNativeCoin&&this.outputIsNativeCoin)},inputIsNativeCoin(){return String(this.inputToken?.address).toLowerCase()==String(d).toLowerCase()},inputIsWrappedNativeCoin(){return String(this.inputToken?.address).toLowerCase()==String(f[this.$config.supportedChainId]).toLowerCase()},outputIsNativeCoin(){return String(this.outputToken?.address).toLowerCase()==String(d).toLowerCase()},outputIsWrappedNativeCoin(){return String(this.outputToken?.address).toLowerCase()==String(f[this.$config.supportedChainId]).toLowerCase()}},methods:{async swap(){this.waiting=!0;const s=x(this.inputTokenAmount,this.inputToken?.decimals),e=d;try{const i=await $(this.signer,this.address,this.inputToken,this.outputToken,s,this.outputTokenAmountWei,this.routerAddress,e),a=this.toast({component:B,props:{text:"Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."}},{type:"info",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+i.hash,"_blank").focus()}),o=await i.wait();o.status===1?(this.toast.dismiss(a),this.toast("You have successfully swapped "+this.inputToken.symbol+" for "+this.outputToken.symbol+"!",{type:"success",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+i.hash,"_blank").focus()}),this.$emit("changeInputTokenBalance"),this.waiting=!1,document.getElementById("closeSwapTokensModal"+this.modalId).click()):(this.waiting=!1,this.toast.dismiss(a),this.toast("Transaction has failed.",{type:"error",onClick:()=>window.open(this.$config.blockExplorerBaseUrl+"/tx/"+i.hash,"_blank").focus()}),console.log(o))}catch{this.toast.error("Something went wrong while swapping tokens"),this.waiting=!1;return}this.waiting=!1}},setup(){const{address:s,signer:e}=W(),i=P(),a=E();return{address:s,signer:e,siteStore:a,toast:i}}},Ct=["id","aria-labelledby"],It={class:"modal-dialog"},St={class:"modal-content"},Bt={class:"modal-header"},Wt=["id"],Nt=["id"],Ot={class:"modal-body"},Et=n("p",null,"Double-check the swap amounts:",-1),Lt={class:"input-group mb-3"},Mt={class:"input-group-text",id:"basic-addon1"},Ft=["value"],Ut=n("h4",{class:"text-center mt-2"},[n("i",{class:"bi bi-arrow-down"})],-1),Ht={class:"input-group mb-3"},Pt={class:"input-group-text",id:"basic-addon1"},Dt=["value"],Rt={key:0},Vt={class:"modal-footer"},Yt=["disabled"],Kt={key:0,class:"spinner-border spinner-border-sm mx-1",role:"status","aria-hidden":"true"};function Zt(s,e,i,a,o,t){return r(),c("div",{class:"modal fade",id:"swapTokensModal"+i.modalId,tabindex:"-1","aria-labelledby":"swapTokensModalLabel"+i.modalId,"aria-hidden":"true"},[n("div",It,[n("div",St,[n("div",Bt,[n("h1",{class:"modal-title fs-5",id:"swapTokensModalLabel"+i.modalId},"Swap tokens",8,Wt),n("button",{id:"closeSwapTokensModal"+i.modalId,type:"button",class:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"},null,8,Nt)]),n("div",Ot,[Et,n("div",Lt,[n("span",Mt,l(i.inputToken?.symbol),1),n("input",{type:"text",class:"form-control",value:i.inputTokenAmount,disabled:""},null,8,Ft)]),Ut,n("div",Ht,[n("span",Pt,l(i.outputToken?.symbol),1),n("input",{type:"text",class:"form-control",value:i.outputTokenAmount,disabled:""},null,8,Dt)]),t.bothTokensAreNativeCoinOrWrappedToken?h("",!0):(r(),c("small",Rt,[n("em",null," You will get at least "+l(i.outputTokenAmount)+" "+l(i.outputToken?.symbol)+", but probably more ("+l(a.siteStore.getSlippage)+"% slippage). ",1)]))]),n("div",Vt,[n("button",{type:"button",class:"btn btn-primary",onClick:e[0]||(e[0]=(...p)=>t.swap&&t.swap(...p)),disabled:o.waiting},[o.waiting?(r(),c("span",Kt)):h("",!0),D(" Swap tokens ")],8,Yt)])])])],8,Ct)}const jt=O(xt,[["render",Zt]]),Gt={name:"SimpleSwap",props:["outputPlaceholder","poweredBy","routerAddress","swapId","tokens"],data(){return{debounce:null,filterTextInput:"",filterTextOutput:"",inputToken:null,inputTokenAllowance:0,inputTokenAmount:null,inputTokenBalance:null,outputText:"0",outputToken:null,outputTokenAmountWei:null,preswapCheck:!1,priceImpact:0,timeout:800,tokenList:[]}},components:{ConnectWalletButton:X,SwapTokensModal:jt,SwitchChainButton:q,TokenApprovalModal:vt},mounted(){this.tokenList=this.getFilteredTokens(this.tokens.tokens),this.selectInputToken(this.tokenList[0]),this.selectOutputToken(this.tokenList[1]),this.outputPlaceholder&&(this.outputText=this.outputPlaceholder)},computed:{allowanceTooLow(){return Number(this.inputTokenAllowance)<Number(this.inputTokenAmount)},bothTokensAreNativeCoinOrWrappedTokenOrSame(){return this.inputToken.address==d&&this.outputToken.address==f[this.$config.supportedChainId]||this.inputToken.address==f[this.$config.supportedChainId]&&this.outputToken.address==d||this.inputToken.address==d&&this.outputToken.address==d||this.inputToken.address==f[this.$config.supportedChainId]&&this.outputToken.address==f[this.$config.supportedChainId]?!0:this.inputToken.address==this.outputToken.address},bothTokensAreTheSame(){return this.inputToken.address==this.outputToken.address},filteredTokensInput(){const s=new RegExp(this.filterTextInput,"i");return this.tokenList.filter(e=>s.test(e.symbol))},filteredTokensOutput(){const s=new RegExp(this.filterTextOutput,"i");return this.tokenList.filter(e=>s.test(e.symbol))},formatInputTokenBalance(){return this.inputTokenBalance?this.inputTokenBalance==0?0:this.inputTokenBalance>100?Number(this.inputTokenBalance).toFixed(2):this.inputTokenBalance>1?Number(this.inputTokenBalance).toFixed(4):this.inputTokenBalance>.01?Number(this.inputTokenBalance).toFixed(6):this.inputTokenBalance>1e-4?Number(this.inputTokenBalance).toFixed(8):Number(this.inputTokenBalance).toFixed(10):0},inputAmountLessThanBalance(){return this.inputTokenAmount&&this.inputTokenBalance?Number(this.inputTokenAmount)<=Number(this.inputTokenBalance):!1},inputIsWrappedNativeCoin(){return String(this.inputToken?.address).toLowerCase()==String(f[this.$config.supportedChainId]).toLowerCase()},isSupportedChain(){return this.chainId===this.$config.supportedChainId},outputIsNativeCoin(){return String(this.outputToken?.address).toLowerCase()==String(d).toLowerCase()},outputTokenAmount(){if(this.outputTokenAmountWei){let s=G(String(this.outputTokenAmountWei),this.outputToken.decimals);return s==0?0:s>100?Number(s).toFixed(2):s>1?Number(s).toFixed(4):s>.01?Number(s).toFixed(6):s>1e-4?Number(s).toFixed(8):Number(s).toFixed(10)}return null},priceImpactTooHigh(){return this.priceImpact>this.$config.swapPriceImpactMaxBps},unwrappingWrappedNativeCoin(){return!!(this.inputIsWrappedNativeCoin&&this.outputIsNativeCoin)}},methods:{getTokenAllowance:K,getTokenBalance:Z,changeInputTokenAllowance(s){this.inputTokenAllowance=Number(s)},getFilteredTokens(s){return s.filter(e=>e.swap)},async getOutputAmount(){if(this.inputTokenAmount){if(this.bothTokensAreNativeCoinOrWrappedTokenOrSame)this.outputTokenAmountWei=x(this.inputTokenAmount,this.inputToken.decimals);else{const s=await Q(this.signer,this.inputToken,this.outputToken,this.inputTokenAmount,this.routerAddress),e=Math.floor(Number(this.siteStore.getSlippage)*100);this.outputTokenAmountWei=s.sub(s.div(1e4).mul(e))}this.priceImpact=await z(this.signer,this.inputToken,this.outputToken,this.inputTokenAmount,this.routerAddress)}else this.outputTokenAmountWei=null},getOutputAmountWithTimeout(){this.debounce&&clearTimeout(this.debounce);const s=this;this.debounce=setTimeout(()=>{s.getOutputAmount()},s.timeout)},async selectInputToken(s){this.inputTokenAllowance=0,this.outputTokenAmountWei=null,this.inputToken=s,this.inputTokenAmount=null,this.signer&&(this.inputTokenBalance=await this.getTokenBalance(s,this.address,this.signer)),s.address==d?this.inputTokenAllowance=Number(J):this.inputTokenAllowance=await this.getTokenAllowance(s,this.address,this.routerAddress,this.signer)},selectOutputToken(s){this.outputToken=s,this.outputTokenAmountWei=null},setMaxInputTokenAmount(){this.inputTokenAmount=String(this.inputTokenBalance),this.getOutputAmount()},subtractInputTokenBalance(){this.inputTokenBalance=Number(this.inputTokenBalance)-Number(this.inputTokenAmount)},togglePreswapCheck(){this.preswapCheck=!this.preswapCheck}},setup(){const{address:s,chainId:e,isActivated:i,signer:a}=W(),o=E();return{address:s,chainId:e,isActivated:i,signer:a,siteStore:o}},watch:{async isActivated(){this.address&&(this.inputTokenBalance=await this.getTokenBalance(this.inputToken,this.address,this.signer))}}},Jt={class:"input-group mb-1"},Xt={class:"btn btn-primary dropdown-toggle",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},qt={class:"dropdown-menu p-2"},zt=["onClick"],Qt=n("small",null,"MAX",-1),$t=[Qt],te=n("em",null,"Balance: ",-1),ee={class:"cursor-pointer hover-color"},ne=n("i",{class:"bi bi-arrow-down"},null,-1),oe=[ne],se={class:"input-group mt-4"},ie={class:"btn btn-primary dropdown-toggle",type:"button","data-bs-toggle":"dropdown","aria-expanded":"false"},ae={class:"dropdown-menu p-2"},ue=["onClick"],re=["value","placeholder"],le={key:0},de={class:"d-flex justify-content-center mt-4"},ce={key:2,disabled:!0,class:"btn btn-outline-primary",type:"button"},pe=["data-bs-target"],he=["disabled","data-bs-target"],me={key:5,disabled:!0,class:"btn btn-outline-primary",type:"button"},ke={key:6,disabled:!0,class:"btn btn-outline-primary",type:"button"},Te={key:7,disabled:!0,class:"btn btn-outline-primary",type:"button"},be={key:1,class:"text-center mt-4"};function fe(s,e,i,a,o,t){const p=C("ConnectWalletButton"),m=C("SwitchChainButton"),w=C("TokenApprovalModal"),k=C("SwapTokensModal");return r(),c("div",null,[n("div",Jt,[n("button",Xt,l(o.inputToken?.symbol),1),n("ul",qt,[I(n("input",{class:"form-control mb-2",placeholder:"Filter tokens","onUpdate:modelValue":e[0]||(e[0]=u=>o.filterTextInput=u)},null,512),[[S,o.filterTextInput]]),(r(!0),c(M,null,F(t.filteredTokensInput,u=>(r(),c("li",{key:u.address,class:"cursor-pointer"},[n("span",{onClick:b=>t.selectInputToken(u),class:"dropdown-item"},l(u.symbol)+" ("+l(u.name)+")",9,zt)]))),128))]),I(n("input",{"onUpdate:modelValue":e[1]||(e[1]=u=>o.inputTokenAmount=u),type:"text",class:"form-control",placeholder:"0.00",onKeyup:e[2]||(e[2]=(...u)=>t.getOutputAmountWithTimeout&&t.getOutputAmountWithTimeout(...u))},null,544),[[S,o.inputTokenAmount]]),n("button",{onClick:e[3]||(e[3]=(...u)=>t.setMaxInputTokenAmount&&t.setMaxInputTokenAmount(...u)),class:"btn btn-outline-secondary",type:"button",id:"button-addon2"},$t)]),n("small",{onClick:e[4]||(e[4]=(...u)=>t.setMaxInputTokenAmount&&t.setMaxInputTokenAmount(...u))},[te,n("em",ee,l(t.formatInputTokenBalance)+" "+l(o.inputToken?.symbol),1)]),n("h4",{onClick:e[5]||(e[5]=(...u)=>t.getOutputAmount&&t.getOutputAmount(...u)),class:"text-center mt-2 cursor-pointer"},oe),n("div",se,[n("button",ie,l(o.outputToken?.symbol),1),n("ul",ae,[I(n("input",{class:"form-control mb-2",placeholder:"Filter tokens","onUpdate:modelValue":e[6]||(e[6]=u=>o.filterTextOutput=u)},null,512),[[S,o.filterTextOutput]]),(r(!0),c(M,null,F(t.filteredTokensOutput,u=>(r(),c("li",{key:u.address,class:"cursor-pointer"},[n("span",{onClick:b=>t.selectOutputToken(u),class:"dropdown-item"},l(u.symbol)+" ("+l(u.name)+")",9,ue)]))),128))]),n("input",{type:"text",class:"form-control",value:t.outputTokenAmount,placeholder:o.outputText,disabled:""},null,8,re)]),t.outputTokenAmount&&!t.bothTokensAreNativeCoinOrWrappedTokenOrSame?(r(),c("small",le,[n("em",null," You will get at least "+l(t.outputTokenAmount)+" "+l(o.outputToken.symbol)+", but probably more ("+l(a.siteStore.getSlippage)+"% slippage). ",1)])):h("",!0),n("div",de,[!a.isActivated&&!t.isSupportedChain?(r(),U(p,{key:0,class:"btn btn-outline-primary",btnText:"Connect wallet"})):h("",!0),a.isActivated&&!t.isSupportedChain?(r(),U(m,{key:1})):h("",!0),a.isActivated&&t.isSupportedChain&&!o.inputTokenAmount?(r(),c("button",ce," Swap tokens ")):h("",!0),a.isActivated&&t.isSupportedChain&&o.inputTokenAmount&&t.inputAmountLessThanBalance&&!t.bothTokensAreTheSame&&t.allowanceTooLow&&!t.unwrappingWrappedNativeCoin&&!t.priceImpactTooHigh?(r(),c("button",{key:3,class:"btn btn-outline-primary",type:"button","data-bs-toggle":"modal","data-bs-target":"#tokenApprovalModal"+i.swapId}," Approve token ",8,pe)):h("",!0),H(w,{modalId:i.swapId,token:o.inputToken,amount:o.inputTokenAmount,routerAddress:i.routerAddress,onSetApprovalAmount:t.changeInputTokenAllowance},null,8,["modalId","token","amount","routerAddress","onSetApprovalAmount"]),a.isActivated&&t.isSupportedChain&&o.inputTokenAmount&&t.inputAmountLessThanBalance&&!t.bothTokensAreTheSame&&!t.priceImpactTooHigh&&!t.priceImpactTooHigh&&(!t.allowanceTooLow||t.unwrappingWrappedNativeCoin)?(r(),c("button",{key:4,disabled:!o.inputToken||!o.outputToken||!o.inputTokenAmount||!t.outputTokenAmount||!a.isActivated||t.bothTokensAreTheSame||!t.inputAmountLessThanBalance,class:"btn btn-outline-primary",type:"button","data-bs-toggle":"modal","data-bs-target":"#swapTokensModal"+i.swapId,onClick:e[7]||(e[7]=(...u)=>t.getOutputAmount&&t.getOutputAmount(...u))}," Swap tokens ",8,he)):h("",!0),H(k,{modalId:i.swapId,inputToken:o.inputToken,inputTokenAmount:o.inputTokenAmount,outputToken:o.outputToken,outputTokenAmount:t.outputTokenAmount,outputTokenAmountWei:o.outputTokenAmountWei,routerAddress:i.routerAddress,onChangeInputTokenBalance:t.subtractInputTokenBalance},null,8,["modalId","inputToken","inputTokenAmount","outputToken","outputTokenAmount","outputTokenAmountWei","routerAddress","onChangeInputTokenBalance"]),a.isActivated&&t.isSupportedChain&&o.inputTokenAmount&&!t.inputAmountLessThanBalance&&!t.bothTokensAreTheSame&&!t.priceImpactTooHigh?(r(),c("button",me," Balance too low ")):h("",!0),a.isActivated&&t.isSupportedChain&&o.inputTokenAmount&&t.bothTokensAreTheSame&&!t.priceImpactTooHigh?(r(),c("button",ke," Both tokens are the same ")):h("",!0),a.isActivated&&t.isSupportedChain&&o.inputTokenAmount&&t.priceImpactTooHigh?(r(),c("button",Te," Price impact too high ")):h("",!0)]),i.poweredBy?(r(),c("p",be,[n("small",null,[n("em",null,"Powered by "+l(i.poweredBy)+".",1)])])):h("",!0)])}const Ce=O(Gt,[["render",fe]]);export{Ce as S};
