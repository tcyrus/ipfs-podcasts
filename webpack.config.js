const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  externals: {
    'aplayer': 'APlayer',
    'hls': 'Hls',
    'hlsjs-ipfs-loader': 'HlsjsIpfsLoader'
  },
  plugins: [
    new CopyPlugin([
      { from: 'public', to: '.' },
    ]),
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    }]
  }
};
