const amqp = require('amqp-connection-manager')
const fs = require('fs')
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
    types.ConnectorRegistry.register(new types.Connectors.DAPNETConnector(connection))
}
if (!!config.connectors.ecityruf && config.connectors.ecityruf.enabled === true) {
    types.ConnectorRegistry.register(new types.Connectors.eCityrufConnector(connection))
}
types.ConnectorRegistry.register(new types.Connectors.DummyConnector())

types.DeviceRegistry.register(new types.devices.GenericPager())
types.DeviceRegistry.register(new types.devices.BirdySlim())
types.DeviceRegistry.register(new types.devices.Skyper())

const express = require('express')
const app = express(), appConfig = express()
app.use(express.json())
app.use(express.static('html_main'))
appConfig.use(express.json())
appConfig.use(express.static('html'))

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

app.get('/api/message/recent', async (req, res) => {
    let msgs = Object.values(types.MessageManager.messages)
    .sort((a,b) => b.date-a.date)
    return res.json(msgs)
})

app.get('/api/message/ack/recv/:id', async (req, res) => {
    types.ConnectorRegistry.reportDelivered({ id: req.params.id }, 'http')
    types.MessageManager.attachMetadata(req.params.id, {
        ack: 'recv',
        rssi: 0x00,
        date: new Date(),
        metadata: { http: true },
    })
    return res.json(true)
})
app.get('/api/message/ack/read/:id', async (req, res) => {
    types.MessageManager.markMessageRead(req.params.id)
    types.MessageManager.attachMetadata(req.params.id, {
        ack: 'read',
        date: new Date(),
        metadata: { http: true },
    })
    return res.json(true)
})

app.get('/api/device/:id', async (req, res) => {
    return res.json(
        req.params.id.length == 1
            ? Object.keys(types.DeviceRegistry.DeviceStates)
            : types.DeviceRegistry.DeviceStates[ req.params.id ]
    )
})

app.get('/api/devices', async (req, res) => {
    return res.json(types.DeviceRegistry.DeviceStates)
})

/** CONFIG Routes */

appConfig.get('/config', async (req, res) => {
    return res.json(JSON.parse(fs.readFileSync('config.json')))
})
appConfig.post('/config', async (req, res) => {
    if (!(!!req.body.general)) return res.status(403).json(false)
    if (!(!!req.body.connectors)) return res.status(403).json(false)
    if (!(!!req.body.pagers)) return res.status(403).json(false)
    console.log(req.body)
    fs.writeFileSync('config.json', JSON.stringify(req.body, null, "\t"))
    return res.json(true)
})
appConfig.post('/restart', (req, res) => {
    process.exit(1)
})

/*const memstats = () => {
    const used = process.memoryUsage()
    for (let key in used) {
        console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
    }
}
memstats()
setInterval(memstats, 10e3)*/


app.listen(config.general.port)
if (config.general.configWebInterfaceEnabled === true) {
    appConfig.listen(config.general.configPort)
}