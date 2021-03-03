class Connector {
  constructor (amqpConnMngr) {
    this.amqpConnMngr = amqpConnMngr
    this.name = "_base"
  }
  transmitMessage(msg) {
    throw "not implemented"
  }
}
module.exports = Connector