import{u as s}from"./ethers.cfeb6c38.js";import{C as n}from"./ChatFeed.58c7378b.js";import{a as i,c as p,r as m,o as a}from"./entry.5fb68691.js";import"./textUtils.2928741a.js";import"./ChatPost.6d9aa3f2.js";import"./user.8396eceb.js";import"./Image.d40b4ac0.js";import"./ipfsUtils.ec0727d2.js";import"./domainUtils.7c2c0a2a.js";import"./SwitchChainButton.a9b02ccd.js";import"./WaitingToast.f216de8b.js";import"./storageUtils.ed80ecc5.js";import"./MintedPostImage.6b26bb62.js";import"./site.9e2cc5b4.js";import"./balanceUtils.c7be8f62.js";import"./ConnectWalletButton.98b3f2c3.js";import"./FileUploadModal.09bc41ad.js";const c={name:"index",components:{ChatFeed:n},computed:{getOrbisContext(){return this.$config.orbisTest?this.$config.orbisTestContext:this.$config.chatChannels.general}},setup(){const{address:t,chainId:o}=s();return{address:t,chainId:o}}};function d(t,o,h,u,f,e){const r=m("ChatFeed");return a(),p(r,{class:"mt-1",showQuotedPost:t.$config.showRepliesOnHomepage,orbisContext:e.getOrbisContext},null,8,["showQuotedPost","orbisContext"])}const H=i(c,[["render",d]]);export{H as default};
