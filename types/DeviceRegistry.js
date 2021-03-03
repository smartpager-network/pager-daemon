const { GenericPager, BirdySlim } = require("./devices")

class DeviceRegistry {
    constructor() {
        this.Devices = {}
    }
    register(device) {
        this.Devices[ device.name ] = device
    }
}
const registry = new DeviceRegistry()
registry.register(new GenericPager())
registry.register(new BirdySlim())
module.exports = registry