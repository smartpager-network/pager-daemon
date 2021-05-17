class PagerDevice {
  constructor () {
    this.duplex = false
    this.supportBOSkrypt = false
    this.name = "_base"
  }
  async formatTX(msg) { }
  async tryReceive(data, connector) { }
  RandID() { }
}
module.exports = PagerDevice