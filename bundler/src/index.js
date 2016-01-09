/**
 * Just the initializer for babel
 * to work with un-compiled babel code from npm-http-server
 */
require('babel-register')({
  ignore: /node_modules\/(?!npm-http-server)/
})
require('./server')
