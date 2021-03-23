class Connector {
  constructor (amqpConnMngr) {
    this.amqpConnMngr = amqpConnMngr
    this.name = "_base"
    this.duplexCapable = false
  }
  Hook (connectorRegistry) {
    this.connectorRegistry = connectorRegistry
    this.connectorRegistry.events.emit('ping', this.name)
  }
  async transmitMessage(uuid, msg, params) {
    throw "not implemented"
  }
}
module.exports = Connector