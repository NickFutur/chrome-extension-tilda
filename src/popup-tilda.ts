interface StructureResult {
  url: string
  title: string
  nodeCount: number
  tildaBlocks: Array<{
    className: string
    id: string
    url: string
    isVisible: boolean
  }>
}

const app = document.getElementById('app')!
app.innerHTML = `
  <h1>FindTilda</h1>
  <button id="scan">Сканировать сайт</button>
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }

    return entities[char]
  })
}

function renderResult(data: StructureResult) {
  summary.innerHTML = `
    <div class="summary-item"><strong>URL:</strong> ${escapeHtml(data.url)}</div>
    <div class="summary-item"><strong>Title:</strong> ${escapeHtml(data.title)}</div>
    <div class="summary-item"><strong>Tilda blocks:</strong> ${data.tildaBlocks.length}</div>
  `

  if (data.tildaBlocks.length === 0) {
    blocks.innerHTML = '<div class="empty">Блоки Tilda не найдены.</div>'
    return
  }

  blocks.innerHTML = `
    <div class="block-item"><strong>Найденные блоки:</strong></div>
    ${data.tildaBlocks.map(block => `
      <div class="tilda-block">
        <div class="tilda-block-name">${escapeHtml(block.className)}</div>
        <a class="tilda-block-link" href="${escapeHtml(block.url)}" data-block-id="${escapeHtml(block.id)}">
          ${escapeHtml(block.url)}
        </a>
      </div>
    `).join('')}
  `
}

function renderGroupedResult(data: StructureResult) {
  const visibleBlocks = data.tildaBlocks.filter(block => block.isVisible)
  const hiddenBlocks = data.tildaBlocks.filter(block => !block.isVisible)

  summary.innerHTML = `
    <div class="summary-item"><strong>URL:</strong> ${escapeHtml(data.url)}</div>
    <div class="summary-item"><strong>Title:</strong> ${escapeHtml(data.title)}</div>
    <div class="summary-item"><strong>Tilda blocks:</strong> ${data.tildaBlocks.length}</div>
    <div class="summary-item"><strong>Открытые:</strong> ${visibleBlocks.length}</div>
    <div class="summary-item"><strong>Скрытые:</strong> ${hiddenBlocks.length}</div>
  `

  if (data.tildaBlocks.length === 0) {
    blocks.innerHTML = '<div class="empty">Tilda blocks not found.</div>'
    return
  }

  blocks.innerHTML = `
    ${renderBlockGroup('Открытые блоки', visibleBlocks)}
    ${renderBlockGroup('Скрытые блоки', hiddenBlocks)}
  `
}

function renderBlockGroup(title: string, groupBlocks: StructureResult['tildaBlocks']) {
  if (groupBlocks.length === 0) {
    return `
      <section class="tilda-block-group">
        <h2>${escapeHtml(title)} <span>0</span></h2>
        <div class="empty">No blocks in this group.</div>
      </section>
    `
  }

  return `
    <section class="tilda-block-group">
      <h2>${escapeHtml(title)} <span>${groupBlocks.length}</span></h2>
      ${groupBlocks.map(block => `
        <div class="tilda-block ${block.isVisible ? 'is-visible' : 'is-hidden'}">
          <div class="tilda-block-name">${escapeHtml(block.className)}</div>
          <a class="tilda-block-link" href="${escapeHtml(block.url)}" data-block-id="${escapeHtml(block.id)}">
            ${escapeHtml(block.url)}
          </a>
        </div>
      `).join('')}
    </section>
  `
}

async function scanPage() {
  const tab = await getActiveTab()

  if (!tab?.id) {
    showError('Активная вкладка не найдена.')
    return
  }

  try {
    const result = await chrome.tabs.sendMessage<StructureResult>(tab.id, { type: 'collectStructure' })
    renderGroupedResult(result)
  } catch (error) {
    showError('Content script недоступен. Обновите страницу и попробуйте снова.')
  }
}

function showError(message: string) {
  summary.innerHTML = `<div class="error">${escapeHtml(message)}</div>`
  blocks.innerHTML = ''
}

document.getElementById('scan')!.addEventListener('click', scanPage)

blocks.addEventListener('click', async event => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('.tilda-block-link')

  if (!link) {
    return
  }

  event.preventDefault()

  const tab = await getActiveTab()
  const blockId = link.dataset.blockId

  if (!tab?.id || !blockId) {
    return
  }

  await chrome.tabs.sendMessage(tab.id, { type: 'scrollToTildaBlock', id: blockId })
})
