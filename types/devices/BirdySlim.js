const MessageManager = require("../MessageManager")
const PagerDevice = require("./Device")
const Str = require('@supercharge/strings')

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
        msg.payload = msg.type === 'duplex' ? `${ msg.id }${ msg.payload }` : msg.payload // only if duplex wanted we add the id
    }
}
module.exports = BirdySlim