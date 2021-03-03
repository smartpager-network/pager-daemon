class Connector {
  constructor (amqpConnMngr) {
    this.amqpConnMngr = amqpConnMngr
    this.name = "_base"
  }
  async transmitMessage(msg, params) {
    throw "not implemented"
  }
}
module.exports = Connector