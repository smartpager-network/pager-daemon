const amqp = require('amqp-connection-manager')

// Create a connetion manager
const connection = amqp.connect(['amqp://daemon:daemon@10.13.37.37:5672/'])
connection.on('connect', () => console.log('Connected!'))
connection.on('disconnect', err => console.log('Disconnected.', err.stack))

const types = require('./types') // also initalized the CentralEventEmitter
types.ConnectorRegistry.register(new types.Connectors.POCSAGConnector(connection)) // activate POCSAG

types.ConnectorRegistry.transmit("pocsag", {
    ric: '133701',
    body: "AAAA"
})