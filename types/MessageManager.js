const ConnectorRegistry = require("./ConnectorRegistry")
const config = require('../config.json')
const md5 = require('md5')

class MessageManager {
    constructor() {
        this.messages = {}
        ConnectorRegistry.events.on('msg:status', this.msgStatus.bind(this))
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
        this.messages[ msgObj.id ]._routerData = this.messages[ msgObj.id ]._routerData || {}
        const hwDuplexSupport = require("./DeviceRegistry").Devices[ routingParams.device ].duplex || false
        Object.assign(this.messages[ msgObj.id ]._routerData, hwDuplexSupport ? {
            duplexCapable: true,
            recvAck: false,
            readAck: false,
            response: false,
            deliveryLog: {},
        } : {
            duplexCapable: false,
            deliveryLog: {},
        })
        console.log('finished msg obj is ', msgObj)
        return msgObj.id
    }
    async msgStatus(msgId, uuid, status) {
        this.messages[ msgId ]._routerData.deliveryLog[ uuid ] = status
        //this.Deliver(msgId)
        console.log(msgId, uuid, 'status is', status)
    }
    async Deliver(msgId) {
        if (this.messages[ msgId ].type === 'duplex')
            this.DeliverDuplex(msgId)
        else
            this.DeliverOneWay(msgId)
    }
    _clearEventHandlers4MsgID(msgId) {
        ConnectorRegistry.events.removeAllListeners(`msg:status:${ msgId }:delivered`)
        ConnectorRegistry.events.removeAllListeners(`msg:status:${ msgId }:failed`)
    }
    async DeliverDuplex(msgId) {
        const msg = this.messages[ msgId ]
        if (!msg._routerData) throw `No Routerdata attached to msg with id ${ msgId }`
        if (!!msg.locked) throw 'message is locked'

        console.log(msg.routingParams.connectors)
        let deliveryChain = msg.routingParams.connectors.map((connectorDeliveryTry) => {
            const   connectorName = connectorDeliveryTry[0],
                    connectorArgs = connectorDeliveryTry.slice(1),
                    connectorConfig = config.connectors[connectorName]
            //const UUID = md5(JSON.stringify(connectorDeliveryTry))
            const chainPromise = (res) => {
                ConnectorRegistry.events.removeAllListeners(`msg:status:${ msgId }:delivered`)
                ConnectorRegistry.events.removeAllListeners(`msg:status:${ msgId }:failed`)
                setTimeout(() => {
                    res([false, 'timeout'])
                }, !!connectorConfig && !!connectorConfig.duplexTimeout ? connectorConfig.duplexTimeout*1e3 : 30e3)
                ConnectorRegistry.events.once(`msg:status:${ msgId }:failed`, () => {
                    console.log(`${ msgId } failed, continuing`)
                    res([false, 'failed'])
                })
                ConnectorRegistry.events.once(`msg:status:${ msgId }:delivered`, () => {
                    console.log(`${ msgId } delivered`)
                    res([true, 'delivered'])
                })
                console.log(`Trying to deliver msg#${ msg.id } with ${ JSON.stringify(connectorDeliveryTry) }`)
                console.log(this.messages[ msgId ].deliveryLog)
                ConnectorRegistry.transmit(connectorName, msg, connectorArgs)
            }
            return chainPromise
        })
        new Promise(async (res, rej) => {
            for(let deliveryFunction of deliveryChain) {
                let result = await new Promise(deliveryFunction)
                if (result[0] === true) { res(result); break; }
                // TODO: handle case, when a different verification channel is used for ACK
            }
            rej()
        })
        .then(($) => {
            this._clearEventHandlers4MsgID(msgId)
            console.log('DELIVERY WAS A SUCCESS', $, this.messages[ msgId ]._routerData.deliveryLog)
        })
        .catch(($) => {
            this._clearEventHandlers4MsgID(msgId)
            console.log('DELIVERY WAS A TOTAL FAILURE , FUCK THIS PLANET', $)
        })
        return true
    }
    async DeliverOneWay(msgId) {
        const msg = this.messages[ msgId ]
        if (!msg._routerData) throw `No Routerdata attached to msg with id ${ msgId }`
        if (!!msg.locked) throw 'message is locked'

        //console.log(msg.routingParams.connectors)
        let deliveryChain = msg.routingParams.connectors.map((connectorDeliveryTry) => {
            const   connectorName = connectorDeliveryTry[0],
                    connectorArgs = connectorDeliveryTry.slice(1),
                    connectorConfig = config.connectors[connectorName]
            const chainPromise = (res, rej) => {
                this._clearEventHandlers4MsgID(msgId)
                setTimeout(() => {
                    res([false, 'timeout'])
                }, !!connectorConfig && !!connectorConfig.simplexTimeout ? connectorConfig.simplexTimeout*1e3 : 2e3)
                ConnectorRegistry.events.once(`msg:status:${ msgId }:failed`, () => {
                    console.log(`${ msgId } failed, continuing`)
                    res([false, 'failed'])
                })
                console.log(`Trying to deliver msg#${ msg.id } with ${ JSON.stringify(connectorDeliveryTry) }`)
                //console.log(this.messages[ msgId ].deliveryLog)
                ConnectorRegistry.transmit(connectorName, msg, connectorArgs)
            }
            return chainPromise
        })
        //console.log(deliveryChain)
        new Promise(async (res, rej) => {
            for(let deliveryFunction of deliveryChain) {
                let result = await new Promise(deliveryFunction)
                if (result[0] === true) { res(result); break; }
            }
            rej()
        })
        .then(($) => {
            this._clearEventHandlers4MsgID(msgId)
            console.log('ROUTING WAS A SUCCESS', $, this.messages[ msgId ]._routerData.deliveryLog)
        })
        .catch(($) => {
            this._clearEventHandlers4MsgID(msgId)
            console.log('ROUTING WAS A TOTAL FAILURE , FUCK THIS PLANET', $)
        })
    }
    async BindMsg(msg) {
        this.messages[ msg.id ] = msg
    }
}
module.exports = new MessageManager()