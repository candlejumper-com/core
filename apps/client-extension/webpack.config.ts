import ModuleFederationPlugin from "webpack/lib/container/ModuleFederationPlugin";
import { SharedMappings, share}from "@angular-architects/module-federation/webpack";
import { ProvidePlugin, optimize } from 'webpack';
import { join, resolve } from "path";

const sharedMappings = new SharedMappings();

// sharedMappings.register(
//   join(__dirname, './tsconfig.inject.json'),
//   [/* mapped paths to share */]);

module.exports = {
  // devServer: {
  //   devMiddleware: {
  //     writeToDisk: true,
  //   },
  // },
  entry: {
    inject: "./apps/client-extension/src/injected/inject.ts",
    "content-script": "./apps/client-extension/src/injected/content-script.ts",
    "service-worker": "./apps/client-extension/src/service-worker/service-worker.ts",
  },
  output: {
    uniqueName: "angularMf",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
    // extensions: [".tsx", ".ts", ".js", ".scss", ".css"],
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new ModuleFederationPlugin({
      library: { type: "module" },
      shared: share({
        ...sharedMappings.getDescriptors()
      })
    }),
    sharedMappings.getPlugin()
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        include: resolve(__dirname, "src/tab"),
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.inject.json',
              attributes: {
                nonce: "randomNonceGoesHere",
              },
            },
          }
        ]
      }
    ]
  }
};