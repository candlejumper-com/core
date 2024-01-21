const path = require('path');
const webpack = require('webpack');
const { composePlugins, withNx } = require('@nx/webpack');
// import * as path from 'path';
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();

sharedMappings.register(
  path.join(__dirname, '../../tsconfig.base.json'),
  [/* mapped paths to share */]);

module.exports = {
  entry: {
    inject: "./apps/client-extension/src/tab/page.ts",
    "service-worker": "./apps/client-extension/src/service-worker.ts",
    "content-script": "./apps/client-extension/src/content-script.ts",
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
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new ModuleFederationPlugin({
      library: { type: "module" },

      // For remotes (please adjust)
      // name: "angularMf",
      // filename: "remoteEntry.js",
      // exposes: {
      //     './Component': './apps/angular-mf/src/app/app.component.ts',
      // },        

      // For hosts (please adjust)
      // remotes: {
      //     "mfe1": "http://localhost:3000/remoteEntry.js",

      // },

      shared: share({
        ...sharedMappings.getDescriptors()
      })
    }),
    sharedMappings.getPlugin()
  ],
};

// module.exports = composePlugins(withNx(), (config, { options, context }) => {
//   // customize webpack config here
//   return config;
// });

// module.exports = {
//   mode: "development",
//   entry: {
//     inject: "./apps/client-extension/src/tab/inject.ts"
//   },
//   output: {
//     iife: false,
//     path: path.join(__dirname, '../../dist/apps/client-extension/browser'),
//     filename: "[name].js" // <--- Will be compiled to this single file
//   },
//   resolve: {
//     extensions: [".ts"],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         loader: "ts-loader",
//         options: {
//           configFile: "tsconfig.app.json"
//         }
//       }
//     ]
//   },
//   plugins: [
//     new webpack.optimize.LimitChunkCountPlugin({
//       maxChunks: 1
//     }),

//   ],
//   optimization: {
//     splitChunks: false
//   }
// };