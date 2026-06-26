interface StructureResult {
  url: string
  title: string
  nodeCount: number
  nodes: Array<{
    tagName: string
    id: string
    classNames: string[]
    depth: number
    childCount: number
  }>
}

const app = document.getElementById('app')!
app.innerHTML = `
  <h1>Page Structure</h1>
  <button id="refresh">Refresh</button>
  <div class="result-box">
    <div class="summary"></div>
    <div class="blocks"></div>
  </div>
`

const summary = app.querySelector('.summary') as HTMLElement
const blocks = app.querySelector('.blocks') as HTMLElement

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}

function renderResult(data: StructureResult) {
  summary.innerHTML = `
    <div class="summary-item"><strong>URL:</strong> ${data.url}</div>
    <div class="summary-item"><strong>Title:</strong> ${data.title}</div>
    <div class="summary-item"><strong>Elements:</strong> ${data.nodeCount}</div>
  `

  const mostUsed = getMostUsedTags(data.nodes)
  blocks.innerHTML = `
    <div class="block-item"><strong>Top tags:</strong></div>
    ${mostUsed.map(item => `<div class="tag-item">${item.tag} — ${item.count}</div>`).join('')}
  `
}

function getMostUsedTags(nodes: StructureResult['nodes']) {
  const counter = new Map<string, number>()
  nodes.forEach(node => counter.set(node.tagName, (counter.get(node.tagName) || 0) + 1))
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }))
}

async function refreshStructure() {
  const tab = await getActiveTab()
  if (!tab?.id) {
    summary.innerHTML = '<div class="error">No active tab found.</div>'
    blocks.innerHTML = ''
    return
  }

  try {
    const data = await chrome.tabs.sendMessage<StructureResult>(tab.id, { type: 'collectStructure' })
    renderResult(data)
  } catch {
    summary.innerHTML = '<div class="error">Unable to contact content script. Reload the page.</div>'
    blocks.innerHTML = ''
  }
}

document.getElementById('refresh')!.addEventListener('click', refreshStructure)
