const { POCSAGConnector } = require("./connectors")

class ConnectorRegistry {
    constructor() {
        this.Connectors = {}
    }
    register(connector) {
        this.Connectors[ connector.name ] = connector
    }
    transmit(name, msg, params) {
        if (!this.Connectors[ name ]) throw "not registred"
        this.Connectors[ name ].transmitMessage(msg, params)
    }
}
const registry = new ConnectorRegistry()
module.exports = registry