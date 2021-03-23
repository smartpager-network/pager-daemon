const MessageManager = require("../MessageManager")
const PagerDevice = require("./Device")
const Str = require('@supercharge/strings')

class GenericPager extends PagerDevice {
  constructor () {
    super()
    this.duplex = false
    this.name = "generic"
  }
  RandID() {
    return `G${ Str.random(8) }`
  }
  async formatTX(msg) {
    msg.id = this.RandID()
    await MessageManager.BindMsg(msg)
    // return msg
  }
}
module.exports = GenericPager