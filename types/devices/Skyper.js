const MessageManager = require("../MessageManager")
const PagerDevice = require("./Device")
const Str = require('@supercharge/strings')

const ascii2skyperTable = {
  148: 125, 129: 126, 225: 127, 127:128
}
class Skyper extends PagerDevice {
  constructor () {
    super()
    this.duplex = false
    this.name = "skyper"
  }
  RandID() {
    return `S${ Str.random(8) }`
  }
  async formatTX(msg) {
    msg.id = this.RandID()
    await MessageManager.BindMsg(msg)
    if (msg.routingParams.skyperNetwork === true) {
      let newPayload = msg.payload.substring(0, 3)
      for(let chr of msg.payload.substring(3).split('')) {
        const orig = chr.charCodeAt(0)
        newPayload += ascii2skyperTable[orig] || String.fromCharCode(orig + 1)
      }
      msg.payload = newPayload
    }
  }
}
module.exports = Skyper