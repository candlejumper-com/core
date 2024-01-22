chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('from the extension222', request)
  var event = new CustomEvent('ToPage', {detail: {symbols: request.symbols}})
  window.dispatchEvent(event)
  sendResponse()
  return true
})

var link = document.createElement('link')
link.href = chrome.runtime.getURL('banner.component.css')
link.rel = 'stylesheet';
document.documentElement.querySelector('#TRADE_BANNER_WRAPPER').shadowRoot.appendChild(link);