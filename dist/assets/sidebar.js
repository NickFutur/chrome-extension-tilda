import"./modulepreload-polyfill.js";const i=document.getElementById("app");i.innerHTML=`
  <h1>Page Structure</h1>
  <button id="refresh">Refresh</button>
  <div class="result-box">
    <div class="summary"></div>
    <div class="blocks"></div>
  </div>
`;const n=i.querySelector(".summary"),c=i.querySelector(".blocks");async function o(){return(await chrome.tabs.query({active:!0,currentWindow:!0}))[0]}function a(t){n.innerHTML=`
    <div class="summary-item"><strong>URL:</strong> ${t.url}</div>
    <div class="summary-item"><strong>Title:</strong> ${t.title}</div>
    <div class="summary-item"><strong>Elements:</strong> ${t.nodeCount}</div>
  `;const s=u(t.nodes);c.innerHTML=`
    <div class="block-item"><strong>Top tags:</strong></div>
    ${s.map(e=>`<div class="tag-item">${e.tag} — ${e.count}</div>`).join("")}
  `}function u(t){const s=new Map;return t.forEach(e=>s.set(e.tagName,(s.get(e.tagName)||0)+1)),Array.from(s.entries()).sort((e,r)=>r[1]-e[1]).slice(0,8).map(([e,r])=>({tag:e,count:r}))}async function d(){const t=await o();if(!(t!=null&&t.id)){n.innerHTML='<div class="error">No active tab found.</div>',c.innerHTML="";return}try{const s=await chrome.tabs.sendMessage(t.id,{type:"collectStructure"});a(s)}catch{n.innerHTML='<div class="error">Unable to contact content script. Reload the page.</div>',c.innerHTML=""}}document.getElementById("refresh").addEventListener("click",d);
//# sourceMappingURL=sidebar.js.map
