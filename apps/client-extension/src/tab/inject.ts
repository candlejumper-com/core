import $ from 'jquery'
import { ISymbol } from '@candlejumper/shared'
import './banner.component'
import { BannerComponent } from './banner.component'

export interface ISymbolExtensionBanner extends ISymbol {
  el$?: JQuery
}

export class TradeBannerApp {
  symbols: ISymbolExtensionBanner[] = []
  shadowRoot: ShadowRoot
  bannerComponent: BannerComponent
  wrapper$: JQuery

  async init() {
    this.setContainer()

    window.addEventListener('ToPage', (event: any) => {
      event.detail.symbols.forEach((symbol: ISymbol) => {
        const existingSymbol = this.symbols.find(symbol2 => symbol2.name === symbol.name)
        if (existingSymbol) {
          // Object.assign(existingSymbol, symbol)
        } else {
          this.symbols.push(symbol)
        }
      })

      console.log('CLIENT UPDATE', this.symbols)
      this.bannerComponent.updateSymbols()
    })
  }

  setContainer() {
    this.wrapper$ = $('<div id="TRADE_BANNER_WRAPPER" style="width: 100%; position: fixed; top: 0; left: 0; right: 0; height: 40px; z-index: 88888;"></div>').prependTo(document.body)
    this.shadowRoot = this.wrapper$[0].attachShadow({ mode: 'open' })
    this.bannerComponent = new BannerComponent(this)
    this.shadowRoot.appendChild(this.bannerComponent)
  }
}

;(async () => await new TradeBannerApp().init())()
