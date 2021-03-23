const amqp = require('amqp-connection-manager')
const config = require('./config.json')

// Create a connetion manager
const connection = amqp.connect(config.general.amqp)
connection.on('connect', () => console.log('Connected to AMQP.'))
connection.on('disconnect', err => console.log('Disconnected from AMQP.', err.stack))

const types = require('./types') // also initializes the registries, if they havent been loaded

if (!!config.connectors.pocsag && config.connectors.pocsag.enabled === true) {
    types.ConnectorRegistry.register(new types.Connectors.POCSAGConnector(connection))
}
if (!!config.connectors.lorawan && config.connectors.lorawan.enabled === true) {
    types.ConnectorRegistry.register(new types.Connectors.LoRaWANConnector(connection))
}
if (!!config.connectors.dapnet && config.connectors.dapnet.enabled === true) {
    types.ConnectorRegistry.register(new types.Connectors.DAPNETConnector())
}
types.ConnectorRegistry.register(new types.Connectors.DummyConnector())

types.DeviceRegistry.register(new types.devices.GenericPager())
types.DeviceRegistry.register(new types.devices.BirdySlim())
types.DeviceRegistry.register(new types.devices.Skyper())

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
/*app.get('/api/message/easy', async (req, res) => {})*/
app.post('/api/message/advanced', async (req, res) => {
    if (!req.body.type) return res.status(500).json("ERROR: no msg type(simple,duplex)")
    if (!req.body.payload) return res.status(500).json("ERROR: no msg payload")
    if (!req.body.routing) return res.status(500).json("ERROR: no msg routing")

    let id = await types.MessageManager.New(req.body.type, req.body.routing, req.body.payload)
    await types.MessageManager.Deliver(id)
    return res.json(id)
})
app.get('/api/message/status/:id', async (req, res) => { //TODO: make this fancy
    return res.json(types.MessageManager.messages[ req.params.id ])
})

app.listen(3000)