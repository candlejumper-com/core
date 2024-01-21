import { ISymbol } from '@candlejumper/shared'

chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
  const user = {
    username: 'demo-user222',
  }

  console.log(2222222, message)

  // 2. A page requested user data, respond with a copy of `user`
  // if (message === 'get-user-data') {
  sendResponse(user)
  // }

  return true
})

class App {
  symbols: ISymbol[] = []

  async init() {
    this.setWebListeners()
    await this.loadSymbols()
    this.startUpdateInterval()
  }

  async loadSymbols() {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    this.symbols = state.symbols.filter((symbol: ISymbol) => !!symbol.insights)
  }

  startUpdateInterval() {
    setInterval(() => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, {symbols: this.symbols});  
        }
    });
    }, 1000)
  }

  setWebListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
      const user = {
        username: 'demo-user',
      }

      console.log(222222222, message)
      // 2. A page requested user data, respond with a copy of `user`
      // if (message === 'get-user-data') {
      sendResponse(user)
      // }

      return true
    })
  }
}

;(async () => {
  const app = new App()
  await app.init()
})()
