const path = require('path')
const productionLogPlugin = require('./index.js')

module.exports = {
  mode: 'none',
  devtool: false,
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, './dist'),
  },
  plugins: [
    new productionLogPlugin()
  ],
}
