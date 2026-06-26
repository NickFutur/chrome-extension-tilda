interface ElementInfo {
  tagName: string
  id: string
  classNames: string[]
  depth: number
  childCount: number
}

interface TildaBlock {
  className: string
  id: string
  url: string
  isVisible: boolean
}

let highlightOverlay: HTMLElement | null = null
let highlightTimeoutId: number | null = null

function createElementInfo(element: Element, depth: number): ElementInfo {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id,
    classNames: Array.from(element.classList),
    depth,
    childCount: element.children.length
  }
}

function isTildaBlockClass(className: string) {
  return /^t\d+$/.test(className)
}

function getBlockAnchor(element: Element, index: number) {
  if (!(element instanceof HTMLElement)) {
    return ''
  }

  if (!element.id) {
    element.id = `findtilda-block-${index + 1}`
  }

  return element.id
}

function createBlockUrl(anchorId: string) {
  const url = new URL(location.href)
  url.hash = anchorId
  return url.href
}

function isHiddenByStyle(element: HTMLElement) {
  let current: HTMLElement | null = element

  while (current) {
    const styles = window.getComputedStyle(current)

    if (
      current.hidden ||
      current.getAttribute('aria-hidden') === 'true' ||
      styles.display === 'none' ||
      styles.visibility === 'hidden' ||
      styles.visibility === 'collapse' ||
      Number(styles.opacity) === 0
    ) {
      return true
    }

    current = current.parentElement
  }

  return false
}

function hasVisibleArea(element: HTMLElement) {
  if (element.getClientRects().length > 0) {
    const rect = getVisibleRect(element)
    return rect.width >= 8 && rect.height >= 8
  }

  return Array.from(element.children).some(child => {
    return child instanceof HTMLElement && hasVisibleArea(child)
  })
}

function isBlockVisible(element: HTMLElement) {
  return !isHiddenByStyle(element) && hasVisibleArea(element)
}

function collectTildaBlocks(): TildaBlock[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[class]'))
    .map((element, index) => {
      const className = Array.from(element.classList).find(isTildaBlockClass)

      if (!className) {
        return null
      }

      const id = getBlockAnchor(element, index)

      if (!id) {
        return null
      }

      return {
        className,
        id,
        url: createBlockUrl(id),
        isVisible: isBlockVisible(element)
      }
    })
    .filter((block): block is TildaBlock => block !== null)
}

function collectStructure(): unknown {
  const root = document.documentElement
  const nodes: ElementInfo[] = []

  function traverse(element: Element, depth: number) {
    nodes.push(createElementInfo(element, depth))
    Array.from(element.children).forEach(child => traverse(child, depth + 1))
  }

  traverse(root, 0)

  return {
    url: location.href,
    title: document.title,
    nodeCount: nodes.length,
    nodes: nodes.slice(0, 200),
    tildaBlocks: collectTildaBlocks()
  }
}

function clearBlockHighlight() {
  if (highlightTimeoutId !== null) {
    window.clearTimeout(highlightTimeoutId)
    highlightTimeoutId = null
  }

  if (highlightOverlay) {
    highlightOverlay.remove()
    highlightOverlay = null
  }
}

function getVisibleRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect()

  if (rect.width >= 8 && rect.height >= 8) {
    return rect
  }

  const childRects = Array.from(element.children)
    .map(child => child.getBoundingClientRect())
    .filter(childRect => childRect.width >= 8 && childRect.height >= 8)

  if (childRects.length === 0) {
    return rect
  }

  const left = Math.min(...childRects.map(childRect => childRect.left))
  const top = Math.min(...childRects.map(childRect => childRect.top))
  const right = Math.max(...childRects.map(childRect => childRect.right))
  const bottom = Math.max(...childRects.map(childRect => childRect.bottom))

  return new DOMRect(left, top, right - left, bottom - top)
}

function highlightBlock(element: HTMLElement) {
  clearBlockHighlight()

  const rect = getVisibleRect(element)
  const className = Array.from(element.classList).find(isTildaBlockClass) ?? 'Tilda block'
  const overlay = document.createElement('div')
  const label = document.createElement('div')

  overlay.style.position = 'absolute'
  overlay.style.left = `${window.scrollX + rect.left}px`
  overlay.style.top = `${window.scrollY + rect.top}px`
  overlay.style.width = `${rect.width}px`
  overlay.style.height = `${rect.height}px`
  overlay.style.border = '4px solid #ff2d00'
  overlay.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.08), 0 0 0 8px rgba(255, 45, 0, 0.22)'
  overlay.style.background = 'rgba(255, 45, 0, 0.06)'
  overlay.style.boxSizing = 'border-box'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '2147483647'

  label.textContent = className
  label.style.position = 'absolute'
  label.style.left = '-4px'
  label.style.top = rect.top > 36 ? '-32px' : '0'
  label.style.padding = '6px 10px'
  label.style.background = '#ff2d00'
  label.style.color = '#ffffff'
  label.style.font = '700 14px/1.2 Arial, sans-serif'
  label.style.borderRadius = '4px 4px 0 0'
  label.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.18)'

  overlay.append(label)
  document.documentElement.append(overlay)
  highlightOverlay = overlay

  highlightTimeoutId = window.setTimeout(clearBlockHighlight, 10000)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'collectStructure') {
    sendResponse(collectStructure())
  }

  if (message?.type === 'scrollToTildaBlock' && typeof message.id === 'string') {
    const element = document.getElementById(message.id)

    if (!element) {
      sendResponse({ ok: false })
      return
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    highlightBlock(element)
    history.replaceState(null, '', `#${encodeURIComponent(message.id)}`)
    sendResponse({ ok: true })
  }
})
