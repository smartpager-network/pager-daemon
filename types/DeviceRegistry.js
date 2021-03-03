class DeviceRegistry {
    constructor() {
        this.Devices = {}
    }
    register(device) {
        this.Devices[ device.name ] = device
    }
}
const registry = new DeviceRegistry()
module.exports = registry