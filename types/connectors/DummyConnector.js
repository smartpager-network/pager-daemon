const Connector = require("./Connector")
const md5 = require('md5')

const config = require('../../config.json')
class DummyConnector extends Connector {
  constructor (amqpConnMngr) {
      super(amqpConnMngr)
      this.name = "dummy"
      this.duplexCapable = true
  }
  async test(msg, UUID) {
    let msgId = msg.payload.substr(0, 5)
    await new Promise((res)=>setTimeout(res,3e3))
    // set Routed
    this.connectorRegistry.reportState(msg, UUID, 'routed')
    await new Promise((res)=>setTimeout(res,6e3))
    this.connectorRegistry.events.emit('response', { //reconstruct the response coming from a lorawan connector
      type: 'ack',
      ack: 'recv',
      rssi: 22,
      msgid: msgId,
      f_port: 1,
      date: new Date(),
      device_id: 'dummy'
    })
    // this will happen somewhere else, down the response processing chain
    //this.connectorRegistry.events.emit(`msg:status:${ msgId }:delivered`)
    //this.connectorRegistry.reportDelivered(msg, UUID) // cheating lol
  }
  async transmitMessage(msg, params) { // lets pretend to be a Birdy Slim
    const UUID = this.name+':'+md5(JSON.stringify([ this.name, ...params ])) // uuid=name+hash of name+args
    if (params[0] == 'fail') {
      await new Promise((res)=>setTimeout(res,3e3))
      this.connectorRegistry.reportFail(msg, UUID)
    } else {
      this.test(msg, UUID)
    }
  }
}
module.exports = DummyConnector