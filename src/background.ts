chrome.runtime.onInstalled.addListener(() => {
  console.log('FindTilda installed')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'ping') {
    sendResponse({ status: 'ok' })
  }
})
