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

async function main() {
    let id = await types.MessageManager.New('simple', { device: null, connectors: [
        ['pocsag', '133701A']
    ] }, "Hallo")
    console.log('msgid', id)
    await types.MessageManager.Deliver(id)
}
main()
/*types.ConnectorRegistry.transmit("pocsag", {
    ric: '133701',
    body: "AAAAhh, ich\n\n\n\nHabe einen Sprung"
})*/