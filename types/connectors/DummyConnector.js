const Connector = require("./Connector")
const md5 = require('md5')

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
    // Pager Configuration Response Format "|5||S||V||G||D||C"
    let virtGPS = "+001.38207+43.7717105"
    let virtSerial = "1337"
    let virtRSSI = "22"
    let virtDate = "01/01/2024"
    let virtBattery = 0x28.toString(16)
    this.connectorRegistry.events.emit('response', `${ msgId }|${ virtSerial }|${ virtBattery }|${ virtGPS }|${ virtDate }|${ virtRSSI }`)
    // this will happen somewhere else, down the response processing chain
    this.connectorRegistry.events.emit(`msg:status:${ msgId }:delivered`)
    this.connectorRegistry.reportDelivered(msg, UUID) // cheating lol
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