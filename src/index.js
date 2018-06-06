/* eslint-disable global-require */
require('babel-polyfill')

if (process.env.NODE_ENV !== 'production') {
  require('babel-register')()
}

require('./app')()
