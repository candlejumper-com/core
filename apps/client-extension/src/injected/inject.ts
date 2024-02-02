import { ISymbol } from '@candlejumper/shared'
import { BannerComponent } from './banner/banner.component'
import { IClientExtensionMessage } from '../service-worker/service-worker.interfaces'
import { CLIENT_EXTENSION_MESSAGE_TYPE } from '../service-worker/service-worker.util'

export interface ISymbolExtensionBanner extends ISymbol {
  el$?: JQuery
}

export interface IClientExtensionMessageEvent extends Event {
  detail: IClientExtensionMessage
}


export class TradeBannerApp {
  symbols: ISymbolExtensionBanner[] = []
  shadowRoot: ShadowRoot
  bannerComponent: BannerComponent
  wrapper$: JQuery

  async init() {
    this.injectBannerComponent()

    window.addEventListener('TradeBot', ({detail}: any) => this.onMessage(detail))
  }

  injectBannerComponent() {
    this.bannerComponent = new BannerComponent(this)
    document.body.prepend(this.bannerComponent)
  }

  toggle(visible: boolean) {
    this.bannerComponent?.toggleVisibility(visible)
  }

  onMessage(message: IClientExtensionMessage) {
    console.debug('inject - onMessage', event)

    switch (message.type) {
      case CLIENT_EXTENSION_MESSAGE_TYPE.SYMBOLS_UPDATE:
        this.onSymbolsUpdate(message.data.symbols)
        break

      case CLIENT_EXTENSION_MESSAGE_TYPE.SETTINGS_UPDATE:
        this.onSettingsUpdate(message.data)
        break
      default:
        console.error('Inject - Unknown event', event)
    }
  }

  private onSymbolsUpdate(symbols: ISymbol[]) {
    symbols.forEach((symbol: ISymbol) => {
      const existingSymbol = this.symbols.find(symbol2 => symbol2.name === symbol.name)
      
      if (existingSymbol) {
        // Object.assign(existingSymbol, symbol)
      } else {
        this.symbols.push(symbol)
      }
    })

    this.bannerComponent?.updateSymbols()
  }

  private onSettingsUpdate(settings: any) {
    this.toggle(settings.visible)
  }
}

new TradeBannerApp().init().catch(console.error)
