/*eslint-disable no-console */
require('babel-core/register')

var port = process.env.PORT || 5000

var express = require('express')
var createRequestHandler = require('./modules').createRequestHandler

var app = express()
var cors = require('cors')

app.disable('x-powered-by')
app.use(cors())
app.use(express.static('public', { maxAge: 60000 }))
app.use(
  createRequestHandler()
)

app.listen(port, function () {
  console.log('Server started on port ' + port + '. Ctrl+C to quit')
})
