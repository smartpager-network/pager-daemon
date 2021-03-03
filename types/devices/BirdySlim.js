const PagerDevice = require("./Device")

// Birdy Slim (IoT) Device
class BirdySlim extends PagerDevice {
    constructor () {
        super()
        this.name = "birdyslim"
    }
    formatTX(msg) {
    }
}
module.exports = BirdySlim