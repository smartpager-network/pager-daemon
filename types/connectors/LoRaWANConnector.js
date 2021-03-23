const Connector = require("./Connector")

class LoRaWANConnector extends Connector {
  // this is optimized for only receiving LoRa uplink Messages (from Birdy Pagers)

  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "lorawan"
    this.duplexCapable = true
  }
}
module.exports = LoRaWANConnector