import"./modulepreload-polyfill.js";const d=document.getElementById("app");d.innerHTML=`
  <h1>FindTilda Options</h1>
  <label><input type="checkbox" id="includeHidden" /> Include hidden elements</label>
  <p><button id="save">Созранить настройки</button></p>
  <p id="status"></p>
`;const t=document.getElementById("includeHidden"),e=document.getElementById("status");async function c(){const n=await chrome.storage.sync.get({includeHidden:!1});t.checked=n.includeHidden}async function i(){await chrome.storage.sync.set({includeHidden:t.checked}),e.textContent="Saved.",setTimeout(()=>{e.textContent=""},1500)}document.getElementById("save").addEventListener("click",i);c();
//# sourceMappingURL=options.js.map
