import { ISymbol } from '@candlejumper/shared'

// chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
//   const user = {
//     username: 'demo-user222',
//   }

//   console.log(2222222, message)

//   // 2. A page requested user data, respond with a copy of `user`
//   // if (message === 'get-user-data') {
//   sendResponse(user)
//   // }

//   return true
// })

class App {
  symbols: ISymbol[] = []

  async init() {
    // this.setWebListeners()
    await this.loadSymbols()
    this.startUpdateInterval()
  }

  async loadSymbols() {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    this.symbols = state.symbols.filter((symbol: ISymbol) => !!symbol.insights)
  }

  startUpdateInterval() {
    setInterval(async () => {
      const tabs = await chrome.tabs.query({ active: true})

      for (var i = 0; i < tabs.length; i++) {
        const tab = tabs[i]
        if (tab.status !== 'complete') {
          continue
        }

        try {
          const result = await chrome.storage.local.get('TRADE_BANNER_SHOW')
          await chrome.tabs.sendMessage(tab.id, { symbols: this.symbols , showBanner: result['TRADE_BANNER_SHOW'] })
        } catch (error) {
          console.log(tab)
          console.error(error)
        }
      }
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

new App().init()
