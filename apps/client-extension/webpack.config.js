const path = require('path');
const webpack = require('webpack');
// import * as path from 'path';

module.exports = {
  mode: "development",
  entry: "./src/inject.ts",
  output: {
    path: path.join(__dirname, '../../dist/apps/client-extension/browser'),
    filename: "inject.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          // configFile: "tsconfig.inject.json"
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
    }),

],
optimization: {
  splitChunks: false
}
};