const Connector = require("./Connector")

class DAPNETConnector extends Connector {
  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "dapnet"
    this.duplexCapable = false
  }
}
module.exports = DAPNETConnector