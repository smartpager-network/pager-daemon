class DeviceRegistry {
    constructor() {
        this.Devices = {}
        this.DeviceStates = {} // for keeping device states
    }
    register(device) {
        this.Devices[ device.name ] = device
    }
    getDevices() {
        return Object.values(this.Devices)
    }
    stateSet(deviceType, deviceId, stateData) {
        const key = `${ deviceType }:${ deviceId }`
        if (!this.DeviceStates[ key ]) 
            this.DeviceStates[ key ] = {}
        Object.assign(this.DeviceStates[ key], stateData)
    }
    /*tryReceive(deviceName, data) {
        return this.Devices[ deviceName ].tryReceive(data)
    }*/
}
const registry = new DeviceRegistry()
module.exports = registry