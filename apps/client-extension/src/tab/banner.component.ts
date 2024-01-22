import $ from 'jquery'
import html from '!raw-loader!./banner.component.html'
// import { Web3Connect } from './web3.connect'
import { TradeBannerApp } from './inject'

// const myText = require('!raw-loader!./banner.component.scss').default;
// console.log(myText)
let done = false
export class BannerComponent extends HTMLElement {
  static tagName = 'trade-banner'

  container$: JQuery
  connectBtn$: JQuery
  newsContainer$: JQuery
  marqueeContainers = []

  observers: IntersectionObserver[] = []

  constructor(public app: TradeBannerApp) {
    super()
  }

  connectedCallback() {
    this.container$ = $(html).appendTo(this)
    this.connectBtn$ = this.container$.find(`#connectButton`).on('click', () => this.onClickConnect())
    this.newsContainer$ = $(this).find('#TRADE_BANNER_NEWS')
  }

  onClickConnect() {
    this.connectBtn$.toggleClass('d-none', false)
    // Web3Connect.connect()
  }

  updateSymbols() {
    this.app.symbols.forEach(symbol => {
      if (!symbol.el$) {
        symbol.el$ = $((`<a>${symbol.name} ${symbol.price}</a>`)).appendTo(this.newsContainer$)
      }
    })

    if (!done) {
      done = true
      this.initializeMarquee()
    }
  }

  initializeMarquee() {
    requestAnimationFrame(() => {
      this.createMarqueeContainer('latest-news')
      this.rotateMarquee(this.marqueeContainers)
    })

  }

  getObjectWidth(obj: HTMLElement) {
    if (obj.offsetWidth) return obj.offsetWidth
    return 0
  }

  createMarqueeContainer(id) {
    const container = $(this).find('#latest-news')[0] as any
    const itemWidth = this.getObjectWidth(container.getElementsByTagName('span')[0]) + 5
    const fullWidth = this.getObjectWidth(container)
    const textContent = container.getElementsByTagName('span')[0].innerHTML
    container.innerHTML = ''
    const height = container.style.height

    container.onmouseout = () => this.rotateMarquee(this.marqueeContainers)

    container.onmouseover = () => cancelAnimationFrame(this.marqueeContainers[0].animationID)

    container.items = []
    const maxItems = Math.ceil(fullWidth / itemWidth) + 1

    for (let i = 0; i < maxItems; i++) {
      container.items[i] = document.createElement('div')
      container.items[i].innerHTML = textContent
      container.items[i].style.position = 'absolute'
      container.items[i].style.left = itemWidth * i + 'px'
      container.items[i].style.width = itemWidth + 'px'
      container.items[i].style.height = height
      container.appendChild(container.items[i])
    }

    this.marqueeContainers.push(container)
  }

  rotateMarquee(containers) {
    if (!containers) return

    for (let j = containers.length - 1; j > -1; j--) {
      const maxItems = containers[j].items.length

      for (let i = 0; i < maxItems; i++) {
        const itemStyle = containers[j].items[i].style
        itemStyle.left = parseInt(itemStyle.left, 10) - 1 + 'px'
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
