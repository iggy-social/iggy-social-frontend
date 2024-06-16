import{m as Y,s as $,j as B,p,B as D,o as n,b as c,e as L,w as N,L as U,Q as H,F,P as R,u as v,N as y,f as r,t as j,l as k,S as E,c as x,a5 as J,a6 as q,a7 as K,a8 as X,a as ee}from"./entry.0ac8adeb.js";import{p as te,E as oe,a as ae}from"./ethers.7e09aab8.js";const ne={key:0,id:"vd-modal-base"},le=B({__name:"Modal",props:{modalOpen:{type:Boolean},dark:{type:Boolean,default:!1}},emits:["close"],setup(t,{emit:d}){const a=t,s=p(()=>a.dark?"modal-inner--dark":"modal-inner");return D(()=>a.modalOpen,i=>{i?document.body.style.overflow="hidden":document.body.style.overflow=""}),(i,g)=>(n(),x(q,{to:"body"},[L(J,{name:"vd-modal-animation"},{default:N(()=>[i.modalOpen?(n(),c("div",ne,[r("div",{class:y(s.value)},[E(i.$slots,"default",{},void 0,!0)],2)])):k("",!0)]),_:3})]))}}),I=(t,d)=>{const a=t.__vccOpts||t;for(const[s,i]of d)a[s]=i;return a},h=I(le,[["__scopeId","data-v-41dea947"]]),ce={},de={width:"400",height:"246",viewBox:"0 0 400 246",xmlns:"http://www.w3.org/2000/svg"},se=r("path",{d:"m81.9180572 48.3416816c65.2149658-63.8508884 170.9493158-63.8508884 236.1642788 0l7.848727 7.6845565c3.260748 3.1925442 3.260748 8.3686816 0 11.5612272l-26.848927 26.2873374c-1.630375 1.5962734-4.273733 1.5962734-5.904108 0l-10.800779-10.5748639c-45.495589-44.5439756-119.258514-44.5439756-164.754105 0l-11.566741 11.3248068c-1.630376 1.5962721-4.273735 1.5962721-5.904108 0l-26.8489263-26.2873375c-3.2607483-3.1925456-3.2607483-8.3686829 0-11.5612272zm291.6903948 54.3649934 23.895596 23.395862c3.260732 3.19253 3.260751 8.368636.000041 11.561187l-107.746894 105.494845c-3.260726 3.192568-8.547443 3.192604-11.808214.000083-.000013-.000013-.000029-.000029-.000042-.000043l-76.472191-74.872762c-.815187-.798136-2.136867-.798136-2.952053 0-.000006.000005-.00001.00001-.000015.000014l-76.470562 74.872708c-3.260715 3.192576-8.547434 3.19263-11.808215.000116-.000019-.000018-.000039-.000037-.000059-.000058l-107.74989297-105.496247c-3.26074695-3.192544-3.26074695-8.368682 0-11.561226l23.89563947-23.395823c3.260747-3.1925446 8.5474652-3.1925446 11.8082136 0l76.4733029 74.873809c.815188.798136 2.136866.798136 2.952054 0 .000012-.000012.000023-.000023.000035-.000032l76.469471-74.873777c3.260673-3.1926181 8.547392-3.1927378 11.808214-.000267.000046.000045.000091.00009.000135.000135l76.473203 74.873909c.815186.798135 2.136866.798135 2.952053 0l76.471967-74.872433c3.260748-3.1925458 8.547465-3.1925458 11.808213 0z",fill:"#3b99fc"},null,-1),ie=[se];function re(t,d){return n(),c("svg",de,ie)}const ue=I(ce,[["render",re]]),Q=Y("vd-modal-store",()=>{const t=$(!1);function d(){t.value=!0}function a(){t.value=!1}return{isModalOpen:t,open:d,close:a}}),M=t=>(K("data-v-ae716cc2"),t=t(),X(),t),me=["onClick"],ve=["src","alt"],pe=M(()=>r("div",null,"WalletConnect",-1)),ke=M(()=>r("img",{class:"vd-logo",src:"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiMwMDUyRkYiLz48cGF0aCBkPSJNMTQuMDM3IDE4LjkyNmMtMi43NSAwLTQuOTA3LTIuMjA1LTQuOTA3LTQuOTI2IDAtMi43MiAyLjIzLTQuOTI2IDQuOTA3LTQuOTI2YTQuODY2IDQuODY2IDAgMCAxIDQuODMzIDQuMTE4aDQuOTgyYy0uNDQ2LTUuMDczLTQuNjg0LTkuMDQ0LTkuODE1LTkuMDQ0QzguNjEgNC4xNDggNC4xNDkgOC41NiA0LjE0OSAxNHM0LjM4NyA5Ljg1MiA5Ljg5IDkuODUyYzUuMjA0IDAgOS4zNjgtMy45NyA5LjgxNC05LjA0M0gxOC44N2E0Ljg2NiA0Ljg2NiAwIDAgMS00LjgzMyA0LjExN1oiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",alt:"Coinbase"},null,-1)),ge=M(()=>r("div",null,"Coinbase",-1)),fe=[ke,ge],we={key:3,id:"vd-no-wallet-found"},Ce={key:0,id:"vd-loading-modal"},ye=M(()=>r("p",null,"Connecting...",-1)),Me=M(()=>r("p",{class:"mt-4"},"Approve or reject request using your wallet",-1)),De=B({__name:"VueDappModal",props:{modelValue:{type:Boolean,default:void 0},dark:{type:Boolean,default:!1},autoConnect:{type:Boolean,default:!1},autoConnectBrowserWalletIfSolo:{type:Boolean,default:!1},hideConnectingModal:{type:Boolean,default:!1}},emits:["update:modelValue","connectError","autoConnectError"],setup(t,{emit:d}){const a=t,s=d,i=Q();function g(){a.modelValue===void 0?i.close():s("update:modelValue",!1)}const u=p(()=>a.modelValue??i.isModalOpen),{isWindowEthereumAvailable:W,connectors:b,connectTo:_,status:O,providerDetails:f,hasConnector:m,disconnect:S}=te();let T;if(a.autoConnect){const{isAutoConnecting:e,error:l}=oe();T=e,D(l,o=>{o&&s("autoConnectError",o)})}D(u,async()=>{if(u.value&&ae()){W&&await w("BrowserWallet",{target:"window.ethereum"});return}u.value&&a.autoConnectBrowserWalletIfSolo&&b.value.length===1&&f.value.length===1&&b.value[0].name==="BrowserWallet"&&await w("BrowserWallet",{target:"rdns",rdns:f.value[0].info.rdns})});async function w(e,l){try{g(),await _(e,l)}catch(o){s("connectError",o)}}function z(){S()}const G={beforeMount:(e,l)=>{e.clickOutsideEvent=C=>{C.stopPropagation(),C.target!==e&&!e.contains(C.target)&&l.value(C)};const o="ontouchstart"in document.documentElement?"touchstart":"click";setTimeout(()=>{document.addEventListener(o,e.clickOutsideEvent)},0)},unmounted:e=>{const l=e.clickOutsideEvent;delete e.clickOutsideEvent;const o="ontouchstart"in document.documentElement?"touchstart":"click";document.removeEventListener(o,l)}},V=p(()=>{let e=f.value.length;return m("WalletConnect")&&e++,m("CoinbaseWallet")&&e++,e<2?1:2}),Z=p(()=>V.value===1),A=p(()=>f.value.length===0&&!m("WalletConnect")&&!m("CoinbaseWallet")),P=p(()=>Z.value?"10px 10px":"15px 15px");return(e,l)=>(n(),c("div",null,[L(h,{modalOpen:u.value,onClose:g,dark:e.dark},{default:N(()=>[U((n(),c("div",{id:"vd-modal",class:"vd-modal-column",style:H({padding:P.value})},[(n(!0),c(F,null,R(v(f),o=>(n(),c("div",{key:o.info.uuid,onClick:C=>w("BrowserWallet",{target:"rdns",rdns:o.info.rdns}),class:y(["vd-wallet-block",{"vd-wallet-block--dark":e.dark}])},[r("img",{class:"vd-logo",src:o.info.icon,alt:o.info.name},null,8,ve),r("div",null,j(o.info.name),1)],10,me))),128)),v(m)("WalletConnect")?(n(),c("div",{key:0,onClick:l[0]||(l[0]=o=>w("WalletConnect")),class:y(["vd-wallet-block",{"vd-wallet-block--dark":e.dark}])},[L(ue,{class:"vd-logo"}),pe],2)):k("",!0),v(m)("CoinbaseWallet")?(n(),c("div",{key:1,onClick:l[1]||(l[1]=o=>w("CoinbaseWallet")),class:y(["vd-wallet-block",{"vd-wallet-block--dark":e.dark}])},fe,2)):k("",!0),A.value&&e.$slots["no-wallet-found"]?E(e.$slots,"no-wallet-found",{key:2},void 0,!0):A.value?(n(),c("div",we,"No wallet provider found \u{1F614}")):k("",!0)],4)),[[G,g]])]),_:3},8,["modalOpen","dark"]),e.hideConnectingModal?k("",!0):(n(),x(h,{key:0,modalOpen:v(O)==="connecting"&&!v(T),dark:e.dark},{default:N(()=>[v(O)==="connecting"?(n(),c("div",Ce,[ye,Me,r("button",{class:y(["vd-cancel-btn",{"vd-cancel-btn--dark":e.dark}]),onClick:z}," Cancel ",2)])):k("",!0)]),_:1},8,["modalOpen","dark"]))]))}}),Oe=I(De,[["__scopeId","data-v-ae716cc2"]]),Le={name:"ConnectWalletButton",props:["btnText"],setup(){const{open:t}=Q();return{open:t}}};function Ne(t,d,a,s,i,g){return n(),c("span",{onClick:d[0]||(d[0]=(...u)=>s.open&&s.open(...u))},j(a.btnText),1)}const Te=ee(Le,[["render",Ne]]);export{Te as C,Oe as D};