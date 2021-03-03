const Connector = require("./Connector")

class LoRaWANConnector extends Connector {
  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "lorawan"
  }
}
module.exports = LoRaWANConnector