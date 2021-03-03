const events = require('events')

module.exports = {
    CentralEventEmitter: new events.EventEmitter(),
    Connectors: require("./connectors"),
    devices: require("./devices"),
    Message: require("./Message"),
    RouteablePage: require("./RouteablePage"),

    DeviceRegistry: require("./DeviceRegistry"),
    MessageManager: require("./MessageManager"),
    ConnectorRegistry: require("./ConnectorRegistry"),
}