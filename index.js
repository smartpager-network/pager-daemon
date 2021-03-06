const amqp = require('amqp-connection-manager')

// Create a connetion manager
const connection = amqp.connect([
    'amqp://daemon:daemon@10.13.37.37:5672/'
])
connection.on('connect', () => console.log('Connected to AMQP.'))
connection.on('disconnect', err => console.log('Disconnected from AMQP.', err.stack))

const types = require('./types') // also initializes the registries, if they havent been loaded
types.ConnectorRegistry.register(new types.Connectors.POCSAGConnector(connection)) // activate POCSAG

types.DeviceRegistry.register(new types.devices.GenericPager())
types.DeviceRegistry.register(new types.devices.BirdySlim())
types.DeviceRegistry.register(new types.devices.Skyper())

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
/*app.get('/api/message/easy', async (req, res) => {})*/
app.get('/api/message/advanced', async (req, res) => {
    if (!req.body.type) return res.status(500).json("ERROR: no msg type(simple,duplex)")
    if (!req.body.payload) return res.status(500).json("ERROR: no msg payload")
    if (!req.body.routing) return res.status(500).json("ERROR: no msg routing")

    let id = await types.MessageManager.New(req.body.type, req.body.routing, req.body.payload)
    await types.MessageManager.Deliver(id)
    return res.json(id)
})
app.listen(3000)