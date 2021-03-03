const { POCSAGConnector } = require("./connectors")

class ConnectorRegistry {
    constructor() {
        this.Connectors = {}
    }
    register(connector) {
        this.Connectors[ connector.name ] = connector
    }
    transmit(name, message) {
        if (!this.Connectors[ name ]) throw "not registred"
        this.Connectors[ name ].transmitMessage(message)
    }
}
const registry = new ConnectorRegistry()
module.exports = registry