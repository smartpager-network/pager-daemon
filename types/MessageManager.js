const ConnectorRegistry = require("./ConnectorRegistry")

class MessageManager {
    constructor() {
        this.messages = {}
    }
    async New(type, routingParams, payload) {
        if (!routingParams.device) {
            routingParams.device = 'generic'
        }
        const msgObj = {
            type,
            routingParams,
            payload,
        }
        await require("./DeviceRegistry").Devices[ routingParams.device ].formatTX(msgObj)
        // console.log('finished msg obj is ', msgObj)
        this.messages[ msgObj.id ]._routerData = this.messages[ msgObj.id ]._routerData || {
            recvAck: false,
            readAck: false,
            response: false,
        }
        console.log('finished msg obj is ', msgObj)
        return msgObj.id
    }
    async Deliver(msgId) {
        const msg = this.messages[ msgId ]
        // Throw error, because wtf
        if (!msg._routerData) throw `No Routerdata attached to msg with id ${ msgId }`
        // attach Start Delivery Unix Timestamp if not already there
        if (!msg._routerData.startDelivery) msg._routerData.startDelivery = Math.floor(new Date().valueOf()/1e3)
        if (!msg._routerData.deliveryLog) msg._routerData.deliveryLog = []
        let logLength = msg._routerData.deliveryLog.length
        if (logLength < msg.routingParams.connectors.length) {
            let deliveryConnector = msg.routingParams.connectors[ logLength ]
            console.log('delivering with ', deliveryConnector)
            const connectorName = deliveryConnector[0]
            await ConnectorRegistry.transmit(connectorName, msg, deliveryConnector.slice(1))
            msg._routerData.deliveryLog.push(deliveryConnector)
            if (msg._routerData.duplexCapable === true || ConnectorRegistry.supportDuplex(connectorName) === true) {
                // we support duplex on connector AND the hardware, lets use it
                
            } else { // if we dont support duplex on the pager or on the connector, we just keep delivering
                await this.Deliver(msgId)
            }
            // msg._routerData.duplexCapable // if PagerHardware supports Duplex
            // ConnectorRegistry.supportDuplex(connectorName) // if Connector supports Duplex
        }
    }
    async BindMsg(msg) {
        this.messages[ msg.id ] = msg
    }
}
module.exports = new MessageManager()