const app = document.getElementById('app')!
app.innerHTML = `
  <h1>FindTilda Options</h1>
  <label><input type="checkbox" id="includeHidden" /> Include hidden elements</label>
  <p><button id="save">Созранить настройки</button></p>
  <p id="status"></p>
`

const includeHidden = document.getElementById('includeHidden') as HTMLInputElement
const status = document.getElementById('status')!

async function loadOptions() {
  const data = await chrome.storage.sync.get({ includeHidden: false })
  includeHidden.checked = data.includeHidden
}

async function saveOptions() {
  await chrome.storage.sync.set({ includeHidden: includeHidden.checked })
  status.textContent = 'Saved.'
  setTimeout(() => { status.textContent = '' }, 1500)
}

document.getElementById('save')!.addEventListener('click', saveOptions)
loadOptions()
