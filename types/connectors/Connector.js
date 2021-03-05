class Connector {
  constructor (amqpConnMngr) {
    this.amqpConnMngr = amqpConnMngr
    this.name = "_base"
    this.duplexCapable = false
  }
  async transmitMessage(msg, params) {
    throw "not implemented"
  }
}
module.exports = Connector