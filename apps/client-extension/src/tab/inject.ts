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
        console.log('toggle')
        this.toggle(event.detail.showBanner)
      }

      console.log('CLIENT UPDATE', event)
    })
  }

  setContainer() {
    // const iframe = document.createElement('iframe')
    // console.log( window.location)
    // iframe.src = window.location.href
    // iframe.style.width = '100%'
    // iframe.style.height = '100%'
    // document.body.innerHTML = ''
    // document.body.appendChild(iframe)
    // Array.from(document.head.children).forEach(child => document.head.removeChild(child))

    // this.wrapper$ = $('<div id="TRADE_BANNER_WRAPPER" style="width: 100%; position: fixed; top: 0; left: 0; right: 0; height: 16px; z-index: 88888;"></div>').prependTo(document.body)
    this.bannerComponent = new BannerComponent(this)
    $(document.body).prepend(this.bannerComponent)
    // this.wrapper$.append(this.bannerComponent)
  }

  toggle(visible: boolean) {
    this.bannerComponent.toggleVisibility(visible)
  }
}

;(async () => await new TradeBannerApp().init())()
