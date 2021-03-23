const events = require('events')

module.exports = {
    CentralEventEmitter: new events.EventEmitter(),
    Connectors: require("./connectors"),
    devices: require("./devices"),
    Message: require("./Message"),

    DeviceRegistry: require("./DeviceRegistry"),
    MessageManager: require("./MessageManager"),
    ConnectorRegistry: require("./ConnectorRegistry"),
}