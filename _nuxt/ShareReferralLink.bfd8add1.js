import{a as u,l as p,v as f,o,b as s,x as m,y as b,f as c,z as i}from"./entry.75da5833.js";import{u as h}from"./user.3108e995.js";import{g}from"./textUtils.9e440f83.js";const k={name:"ShareReferralLink",data(){return{copied:!1}},computed:{getDomainNameOrAddress(){return this.userStore.getDefaultDomain?g(this.userStore.getDefaultDomain):this.address},getReferralLink(){return this.$route.href.includes("?")?window.location.origin+this.$route.href+`&ref=${this.getDomainNameOrAddress}`:window.location.origin+this.$route.href+`?ref=${this.getDomainNameOrAddress}`}},methods:{copyToClipboard(){navigator.clipboard.writeText(this.getReferralLink),this.copied=!0,this.toast("Referral link copied to your clipboard!",{type:"success"})}},setup(){const{address:a}=p(),e=f(),n=h();return{address:a,toast:e,userStore:n}}},y={class:"btn btn-outline-secondary",type:"button",id:"button-addon2"},_={key:0,class:"bi bi-clipboard"},x={key:1,class:"bi bi-clipboard-check"};function D(a,e,n,l,d,r){return l.address?(o(),s("div",{key:0,class:"input-group mb-3",onClick:e[1]||(e[1]=(...t)=>r.copyToClipboard&&r.copyToClipboard(...t))},[m(c("input",{"onUpdate:modelValue":e[0]||(e[0]=t=>r.getReferralLink=t),type:"text",class:"form-control cursor-pointer","aria-label":"Recipient's username","aria-describedby":"basic-addon2",readonly:""},null,512),[[b,r.getReferralLink]]),c("button",y,[d.copied?i("",!0):(o(),s("i",_)),d.copied?(o(),s("i",x)):i("",!0)])])):i("",!0)}const w=u(k,[["render",D]]);export{w as S};