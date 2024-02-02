import $ from 'jquery'
import html from '!raw-loader!./banner.component.html'
// import { Web3Connect } from './web3.connect'
import { TradeBannerApp } from '../inject'

interface IMarqueeContainer {
  el: HTMLElement
  items: HTMLElement[]
  animationID?: number
}

let done = false
export class BannerComponent extends HTMLElement {
  static tagName = 'trade-banner'

  private shadow: ShadowRoot

  private container$: JQuery
  private newsContainer$: JQuery
  private connectBtn$: JQuery
  private visibilityBtn$: JQuery
  private marqueeContainers: IMarqueeContainer[] = []

  constructor(public app: TradeBannerApp) {
    super()
  }

  protected connectedCallback() {
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.innerHTML = html
    this.container$ = $(this.shadow).find('#latest-news')
    this.newsContainer$ = $('#TRADE_BANNER_NEWS', this.container$)
    this.connectBtn$ = this.container$.find(`#connectButton`).on('click', () => this.onClickConnect())
    this.visibilityBtn$ = $(this.shadow).find(`#TRADE_BANNER_CLOSE_BTN`).on('click', () => this.toggleVisibility())
  }

  onClickConnect() {
    this.connectBtn$.toggleClass('d-none', false)
    // Web3Connect.connect()
  }

  updateSymbols() {
    if (!this.container$.length) {
      return
    }

    this.app.symbols.forEach(symbol => {
      if (!symbol.el$) {
        symbol.el$ = $(`<a>${symbol.name} <span style="color: red">${symbol.price}</span></a>`).appendTo(this.newsContainer$)
      }
    })

    if (!done && this.container$.is(':visible')) {
      done = true
      this.initializeMarquee()
    }
  }

  toggleVisibility(visible?: boolean) {
    $(this).toggle(visible)
  }

  initializeMarquee() {
    this.createMarqueeContainer()
    this.rotateMarquee(this.marqueeContainers)
  }

  createMarqueeContainer() {
    const newsContainerContent = this.newsContainer$
    const itemWidth = this.newsContainer$.width() + 5
    const fullWidth = this.container$.width()

    this.container$.html('')

    this.container$.on('mouseout', () => this.rotateMarquee(this.marqueeContainers))
    this.container$.on('mouseover', () => cancelAnimationFrame(this.marqueeContainers[0].animationID))

    const items: HTMLElement[] = []
    const maxItems = Math.ceil(fullWidth / itemWidth) + 1

    for (let i = 0; i < maxItems; i++) {
      items[i] = document.createElement('div')
      items[i].innerHTML = this.newsContainer$.html()
      // items[i].appendChild(newsContainerContent[0])
      items[i].style.position = 'absolute'
      items[i].style.left = itemWidth * i + 'px'
      items[i].style.width = itemWidth + 'px'
      this.container$.append(items[i])
    }

    this.marqueeContainers.push({
      el: this.container$[0],
      items,
    })
  }

  rotateMarquee(containers: IMarqueeContainer[]) {
    if (!containers?.length) return

    for (let j = containers.length - 1; j > -1; j--) {
      const maxItems = containers[j].items.length

      for (let i = 0; i < maxItems; i++) {
        const itemStyle = containers[j].items[i].style
        itemStyle.left = parseInt(itemStyle.left, 10) - 1 + 'px'
      }

      if (!containers[j]?.items?.[0]?.style) {
        break
      }

      const firstItemStyle = containers[j].items[0].style

      if (parseInt(firstItemStyle.left, 10) + parseInt(firstItemStyle.width, 10) < 0) {
        const shiftedItem = containers[j].items.shift()
        shiftedItem.style.left = parseInt(shiftedItem.style.left) + parseInt(shiftedItem.style.width) * maxItems + 'px'
        containers[j].items.push(shiftedItem)
      }
    }

    containers[0].animationID = requestAnimationFrame(() => this.rotateMarquee(containers))
  }
}

customElements.define(BannerComponent.tagName, BannerComponent)
