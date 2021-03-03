const PagerDevice = require("./Device")

// Birdy Slim (IoT) Device
class BirdySlim extends PagerDevice {
    constructor () {
        super()
        this.duplex = true
        this.name = "birdyslim"
    }
    RandID() {
        return `B${ Str.random(4) }`
    }
    async formatTX(msg) {
        msg.id = this.RandID()
        await MessageManager.BindMsg(msg)
        msg.payload = `${ msg.id }${ msg.payload }`
        msg._routerData = {
            recvAck: true,
            readAck: true,
            response: true,
        }
    }
}
module.exports = BirdySlim