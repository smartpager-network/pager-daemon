class DeviceRegistry {
    constructor() {
        this.Devices = {}
    }
    register(device) {
        this.Devices[ device.name ] = device
    }
    getDevices() {
        return Object.values(this.Devices)
    }
    /*tryReceive(deviceName, data) {
        return this.Devices[ deviceName ].tryReceive(data)
    }*/
}
const registry = new DeviceRegistry()
module.exports = registry