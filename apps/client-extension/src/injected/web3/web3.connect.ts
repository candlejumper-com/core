import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
// import { Chain } from "viem"

// window.createWeb3Modal = createWeb3Modal
// window.defaultWagmiConfig = defaultWagmiConfig

export class Web3Connect {
  static async connect() {
    // const projectId = 'afec04d7a28880141f9700fff161b1b5'
    // const metadata = {
    //   name: 'Web3Modal',
    //   description: 'Web3Modal Example',
    //   url: 'https://web3modal.com',
    //   icons: ['https://avatars.githubusercontent.com/u/37784886'],
    // }

    // const chains: Chain[] = [
    //   {
    //     id: 1,
    //     // network: 'homestead',
    //     name: 'Ethereum',
    //     nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    //     rpcUrls: {
    //       alchemy: {
    //         http: ['https://eth-mainnet.g.alchemy.com/v2'],
    //         webSocket: ['wss://eth-mainnet.g.alchemy.com/v2'],
    //       },
    //       infura: {
    //         http: ['https://mainnet.infura.io/v3'],
    //         webSocket: ['wss://mainnet.infura.io/ws/v3'],
    //       },
    //       default: {
    //         http: ['https://cloudflare-eth.com'],
    //       },
    //       public: {
    //         http: ['https://cloudflare-eth.com'],
    //       },
    //     },
    //     blockExplorers: {
    //       etherscan: {
    //         name: 'Etherscan',
    //         url: 'https://etherscan.io',
    //       },
    //       default: {
    //         name: 'Etherscan',
    //         url: 'https://etherscan.io',
    //       },
    //     },
    //     contracts: {
    //       ensRegistry: {
    //         address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    //       },
    //       ensUniversalResolver: {
    //         address: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
    //         blockCreated: 16966585,
    //       },
    //       multicall3: {
    //         address: '0xca11bde05977b3631167028862be2a173976ca11',
    //         blockCreated: 14353601,
    //       },
    //     },
    //   },
    // ]

    // if (window.defaultWagmiConfig) {
    //   const wagmiConfig = window.defaultWagmiConfig({ chains, projectId, metadata })

    //   const modal = window.createWeb3Modal({ wagmiConfig, projectId, chains })
    //   modal.subscribeState(newState => console.log(newState))
    //   modal.open()
    // }
  }
}