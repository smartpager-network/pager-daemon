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
        /*this.birdyParamMapper = {
            //'A': ['beaconIDinstant'], // It is the ID of current localisation beacon.
            //'B': ['beaconIDstored'], // It is the ID of the last localisation beacon seen by the BIRDY
            'C': ['rssi', 2], // It is the POCSAG carrier received level (in dBm) transmitted by the POCSAG emitter and received by the pager.
            //'D': ['date'], // Timestamp in seconds from 01/01/2014.
            //'E': ['beaconRoundIDstored'], // It is the ID of the last round beacon seen by the pager
            'G': ['gps', (1+3+1+5)+(1+2+1+5)+2], // Longitude and latitude in decimal degrees and last acquisition time in minutes.
            'I': ['identityRIC'], // BIRDY first RIC code
            'N': ['messageNumber', 5], // To display message number message must begin with ***Mxxx*** where xxx is the message number.
            'S': ['serial', 13], // BIRDY serial number
            //'T': ['receivedRIC'], // Message receipt RIC code
            'V': ['batteryVoltage', 2], // BIRDY battery voltage in HEX
            //'X': ['lowBattBeacon'], // It is the ID of a beacon with a low battery voltage
            '5': ['msgId', 5], // It is to recall first 5 characters of received message in an acknowledgement.
          }*/
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
        console.log(data)
        if (typeof(data) === 'object' && !!data.type) {
            switch (data.type) {
                case 'ack':
                    if (data.ack === 'recv') {
                        require('../ConnectorRegistry').reportDelivered({ id: data.msgid }, `lorawan:${ data.device_id }`) // cheating lol
                        require('../MessageManager').attachMetadata(data.msgid, data)
                    }
                    break;
            }
            return true
        }
        return false
        // config.pagers.birdyslim.formatRecvAck
    }
}
module.exports = BirdySlim