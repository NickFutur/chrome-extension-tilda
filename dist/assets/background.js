chrome.runtime.onInstalled.addListener(()=>{console.log("FindTilda installed")});chrome.runtime.onMessage.addListener((n,i,d)=>{(n==null?void 0:n.type)==="ping"&&d({status:"ok"})});
//# sourceMappingURL=background.js.map
