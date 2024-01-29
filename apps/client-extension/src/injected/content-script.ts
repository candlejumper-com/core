import { CLIENT_EXTENSION_MESSAGE_TYPE } from "../service-worker/service-worker.util";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug('Content script - received a request from service worker', message)

  const event = new CustomEvent('TradeBot', {detail: message})
  window.dispatchEvent(event)

  if (sendResponse) {
    sendResponse()
    return true
  }

  return false;
});

(() => {
  try {
    const tradeBannerEl = document.documentElement.querySelector('trade-banner')
  
    if (!tradeBannerEl) {
      console.error('tradeBannerEl not found')
      return
    }

    const link = document.createElement('link',)
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('banner.component.css')
    tradeBannerEl.shadowRoot.appendChild(link);
  } catch (error) {
    console.error(error)
  }

  chrome.runtime.sendMessage({type: CLIENT_EXTENSION_MESSAGE_TYPE.TAB_READY});
})()