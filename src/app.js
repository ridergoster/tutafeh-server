/* eslint-disable no-console */
import {
  Server,
} from 'http'

import asciify from 'asciify'
import bodyParser from 'body-parser'
import compression from 'compression'
import config from 'config'
import express from 'express'

import sockets from 'socket'

const packageJson = require(`${process.cwd()}/package.json`)// eslint-disable-line import/no-dynamic-require
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))

app.disable('x-powered-by')

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(compression())

app.get('/', (req, res) => {
  res.send({
    server: true,
  })
})

app.set('json spaces', 2)

const port = config.get('server.port')

module.exports = () => {
  asciify('TUTAFEH-SERVER', {
    color: 'green',
    font: 'smslant',
  }, (err, result) => {
    console.log(result.replace(/\n$/, ''))
    console.log(`tutafeh-server-socket ::::::::::::::::::::::::::::::: v${packageJson.version}\n\n`)

    const server = Server(app)

    server.listen(port, () => {
      console.log(`Server listening on ::${port}`)
    })
    sockets.init(server)
  })
}

module.exports.app = app
