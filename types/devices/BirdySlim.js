const MessageManager = require("../MessageManager")
const PagerDevice = require("./Device")
const Str = require('@supercharge/strings')
const config = require('../../config.json')

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
    async tryReceive(data, connector) {
        if (typeof(data) === 'object' && !!data.type) {
            const stateSet = {
                lastSeen: data.date
            }
            // If we have a Battery Measurement or other Power Events, we should store it
            if (!!data.battery) stateSet.battery = data.battery/1e1
            if (data.hasOwnProperty('isCharging')) stateSet.isCharging = data.isCharging
            if (data.hasOwnProperty('poweredOn')) stateSet.poweredOn = data.poweredOn
    
            // the same if we have an rssi measurement
            if (!!data.rssi) stateSet.rssi = data.rssi
            // and if we have the 3 components of a GPS Block
            if (!!data.latitude && !!data.longitude && !!data.lastGPSAcquisition) stateSet.gps = {
                lastGPSAcquisition: data.lastGPSAcquisition,
                latitude: data.latitude,
                longitude: data.longitude,
            }
            stateSet.lastLoRaPacket = data.metadata
            console.log(data, stateSet)
            /*if (!!data.metadata && !!data.metadata.uplink_message.rx_metadata) {
                const rx_metadata = data.metadata.uplink_message.rx_metadata
                
            }*/

            switch (data.type) {
                case 'ack': {
                        switch (data.ack) {
                            case 'recv': 
                                require('../ConnectorRegistry').reportDelivered({ id: data.msgid }, `lorawan:${ data.device_id }`)
                            break;
                            case 'read':
                                require('../MessageManager').markMessageRead(data.msgid)
                            break;
                            case 'operational':
                                require('../MessageManager').respondToMessage(data.msgid, data.operationalData)
                            break;
                        }
                        // If we have had a Ack. Event, we should store some Metadata about it too
                        require('../MessageManager').attachMetadata(data.msgid, {
                            ack: data.ack,
                            rssi: data.rssi,
                            date: data.date,
                            metadata: data.metadata,
                        })
                    }
                    break;
                case 'sos':
                    stateSet.sos = {
                        sos: data.sos,
                        date: data.date,
                    }
                break;
            }
            require('../DeviceRegistry').stateSet(this.name, data.device_id, stateSet) 
            return true
        }
        return false
    }
}
module.exports = BirdySlim