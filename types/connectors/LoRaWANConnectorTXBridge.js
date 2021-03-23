const Connector = require("./Connector")

class LoRaWANConnectorTXBridge extends Connector {
  // this is optimized for transmitting Downlink Messages via a Special Bridge which overcomes Network Limitations
  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "lorawanbridge"
    this.duplexCapable = true
  }
}
module.exports = LoRaWANConnectorTXBridge