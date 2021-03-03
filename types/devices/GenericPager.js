const PagerDevice = require("./Device")

class GenericPager extends PagerDevice {
    constructor () {
      super()
      this.name = "generic"
    }
    transmit(msg) {
    }
  }
  module.exports = GenericPager