import type { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

declare module '!raw-loader!*' {
  const contents: string;
  export = contents;
}

declare global {
  export interface Window {
    createWeb3Modal: typeof createWeb3Modal
    defaultWagmiConfig: typeof defaultWagmiConfig
  }
}

