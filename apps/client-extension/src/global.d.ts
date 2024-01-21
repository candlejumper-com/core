import type { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

export declare global {
  export interface Window {
    createWeb3Modal: typeof createWeb3Modal
    defaultWagmiConfig: typeof defaultWagmiConfig
  }
}