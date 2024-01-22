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
      if (event.detail?.symbols?.length) {
        event.detail.symbols.forEach((symbol: ISymbol) => {
          const existingSymbol = this.symbols.find(symbol2 => symbol2.name === symbol.name)
          if (existingSymbol) {
            // Object.assign(existingSymbol, symbol)
          } else {
            this.symbols.push(symbol)
          }
        })
        this.bannerComponent.updateSymbols()
      }
      
      if (typeof event.detail?.showBanner === 'boolean') {
        this.toggle(event.detail.showBanner)
      }

      console.log('CLIENT UPDATE', event)
    })
  }

  setContainer() {
    this.wrapper$ = $('<div id="TRADE_BANNER_WRAPPER" style="width: 100%; position: fixed; top: 0; left: 0; right: 0; height: 40px; z-index: 88888;"></div>').prependTo(document.body)
    this.shadowRoot = this.wrapper$[0].attachShadow({ mode: 'open' })
    this.bannerComponent = new BannerComponent(this)
    this.shadowRoot.appendChild(this.bannerComponent)
  }

  toggle(visible: boolean) {
    this.wrapper$.toggle(visible)
  }
}

;(async () => await new TradeBannerApp().init())()
