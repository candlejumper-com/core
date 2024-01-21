chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log('from the extension222', request)
  var event = new CustomEvent('ToPage', {detail: {symbols: request.symbols}})
  window.dispatchEvent(event)
  sendResponse()
  return true
})
