import { ISymbol } from '@candlejumper/shared'
import { IClientExtensionMessage } from './service-worker.interfaces'
import { CLIENT_EXTENSION_MESSAGE_TYPE } from './service-worker.util'

console.info('SERVICES WORKER')

class ServiceWorkerApp {
  private symbols: ISymbol[] = []
  private tabs: chrome.tabs.Tab[] = []
  private apiUrl = 'http://localhost:3000'
  private updateInterval: number

  async init() {
    // this.setWebListeners()
    await this.loadSymbols()

    this.setTabListener()
    this.startUpdateInterval()

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => this.onMessage(message, sender, sendResponse))
  }

  private onMessage(
    message: IClientExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: () => void,
  ): boolean {
    switch (message.type) {
      // on tab ready
      case CLIENT_EXTENSION_MESSAGE_TYPE.TAB_READY:
        this.addActiveTab(sender.tab)
        break

      default:
        console.error('Service-worker - Unkown message type', message)
        break
    }

    return false
  }
  
  async loadSymbols() {
    const url = new URL('/api/app-init', this.apiUrl)
    const response = await fetch(url.href)
    const { state } = await response.json()

    this.symbols = state.symbols
    // this.symbols = state.symbols.filter((symbol: ISymbol) => !!symbol.insights)
  }

  private setTabListener() {
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
      }
      // console.log('changeInfo', changeInfo)
    })

    chrome.tabs.onRemoved.addListener(tabId => this.removeActiveTab(tabId))
  }

  private startUpdateInterval() {
    this.updateInterval = setInterval(async () => this.updateTabs(), 1000)
  }

  private stopUpdateInterval() {
    clearInterval(this.updateInterval)
  }

  private async updateTabs() {
    const tabs = (await chrome.tabs.query({ active: true })).filter(tab => this.tabs.some(t => t.id === tab.id))

    for (var i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      try {
        const result = await chrome.storage.local.get('TRADE_BANNER_SHOW')

        await chrome.tabs.sendMessage(tab.id, {
          type: CLIENT_EXTENSION_MESSAGE_TYPE.SYMBOLS_UPDATE,
          data: { symbols: this.symbols, showBanner: result['TRADE_BANNER_SHOW'] },
        })
      } catch (error: any) {
        console.error(error.message, error.code, error.__proto__, error)
      }
    }
  }

  private addActiveTab(tab: chrome.tabs.Tab) {
    const isNew = !this.getTabById(tab.id)
    
    if (isNew) {
      this.tabs.push(tab)
    }
  }

  private removeActiveTab(tabId: number) {
    this.tabs = this.tabs.filter(tab => tab.id !== tabId)
  }

  private getTabById(tabId: number) {
    return this.tabs.find(tab => tab.id === tabId)
  }
}

new ServiceWorkerApp().init()
