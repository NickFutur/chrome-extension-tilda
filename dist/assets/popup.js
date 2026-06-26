import"./modulepreload-polyfill.js";const c=document.getElementById("app");c.innerHTML=`
  <h1>FindTilda</h1>
  <button id="scan">Сканировать сайт</button>
  <div class="result-box">
    <div class="summary"></div>
    <div class="blocks"></div>
  </div>
`;const a=c.querySelector(".summary"),r=c.querySelector(".blocks");async function d(){return(await chrome.tabs.query({active:!0,currentWindow:!0}))[0]}function e(s){return s.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function u(s){const t=s.tildaBlocks.filter(n=>n.isVisible),i=s.tildaBlocks.filter(n=>!n.isVisible);if(a.innerHTML=`
    <div class="summary-item"><strong>URL:</strong> ${e(s.url)}</div>
    <div class="summary-item"><strong>Title:</strong> ${e(s.title)}</div>
    <div class="summary-item"><strong>Tilda blocks:</strong> ${s.tildaBlocks.length}</div>
    <div class="summary-item"><strong>Открытые:</strong> ${t.length}</div>
    <div class="summary-item"><strong>Скрытые:</strong> ${i.length}</div>
  `,s.tildaBlocks.length===0){r.innerHTML='<div class="empty">Tilda blocks not found.</div>';return}r.innerHTML=`
    ${l("Открытые блоки",t)}
    ${l("Скрытые блоки",i)}
  `}function l(s,t){return t.length===0?`
      <section class="tilda-block-group">
        <h2>${e(s)} <span>0</span></h2>
        <div class="empty">No blocks in this group.</div>
      </section>
    `:`
    <section class="tilda-block-group">
      <h2>${e(s)} <span>${t.length}</span></h2>
      ${t.map(i=>`
        <div class="tilda-block ${i.isVisible?"is-visible":"is-hidden"}">
          <div class="tilda-block-name">${e(i.className)}</div>
          <a class="tilda-block-link" href="${e(i.url)}" data-block-id="${e(i.id)}">
            ${e(i.url)}
          </a>
        </div>
      `).join("")}
    </section>
  `}async function m(){const s=await d();if(!(s!=null&&s.id)){o("Активная вкладка не найдена.");return}try{const t=await chrome.tabs.sendMessage(s.id,{type:"collectStructure"});u(t)}catch{o("Content script недоступен. Обновите страницу и попробуйте снова.")}}function o(s){a.innerHTML=`<div class="error">${e(s)}</div>`,r.innerHTML=""}document.getElementById("scan").addEventListener("click",m);r.addEventListener("click",async s=>{const t=s.target.closest(".tilda-block-link");if(!t)return;s.preventDefault();const i=await d(),n=t.dataset.blockId;!(i!=null&&i.id)||!n||await chrome.tabs.sendMessage(i.id,{type:"scrollToTildaBlock",id:n})});
//# sourceMappingURL=popup.js.map
