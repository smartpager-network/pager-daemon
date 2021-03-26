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
        //console.log(routingParams)
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
            recvAck: false, // aka "delivered"
            readAck: false, // "read"
            response: false, // "resp"
            deliveryLog: {},
        } : {
            duplexCapable: false,
            deliveryLog: {},
        })
        console.log(`Type:\t\t${ type }\nDevice:\t\t${ routingParams.device }`)
        console.log(`Message UUID:\t${ msgObj.id }`)
        console.log(`Connectors:\t${ JSON.parse(JSON.stringify(routingParams.connectors)).map(x=>`${x[0]}=${x.splice(1).join(',')}`).join('&') }`)
        console.log(`Message Original Payload:\t"${ payload }"`)
        console.log(`Processed Device Payload:\t"${ msgObj.payload }"`)
        return msgObj.id
    }
    async msgStatus(msgId, uuid, status) {
        this.messages[ msgId ]._routerData.deliveryLog[ uuid ] = status
        if (status === 'delivered') this.messages[ msgId ]._routerData.recvAck = true
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

        //console.log(msg.routingParams.connectors)
        let deliveryChain = msg.routingParams.connectors.map((connectorDeliveryTry) => {
            const   connectorName = connectorDeliveryTry[0],
                    connectorArgs = connectorDeliveryTry.slice(1),
                    connectorConfig = config.connectors[connectorName]
            //const UUID = md5(JSON.stringify(connectorDeliveryTry))
            const chainPromise = (res) => {
                ConnectorRegistry.events.removeAllListeners(`msg:status:${ msgId }:failed`)
                setTimeout(() => {
                    res([false, 'timeout'])
                }, !!connectorConfig && !!connectorConfig.duplexTimeout ? connectorConfig.duplexTimeout*1e3 : 30e3)
                ConnectorRegistry.events.once(`msg:status:${ msgId }:failed`, () => {
                    console.log(`${ msgId } failed via ${ connectorName }:${ connectorArgs.join(',') }, continuing...`)
                    res([false, 'failed'])
                })
                console.log(`Trying to deliver msg#${ msg.id } with ${ connectorName }:${ connectorArgs.join(',') }`)
                ConnectorRegistry.transmit(connectorName, msg, connectorArgs)
            }
            return chainPromise
        })
        Promise.race([
            new Promise(res => { // Delivery Event for this message
                ConnectorRegistry.events.once(`msg:status:${ msgId }:delivered`, (_, uuid) => {
                    console.log(`${ msgId } delivered via ${ uuid }`)
                    return res()
                })
            }),
            new Promise(async (res, rej) => {
                for(let deliveryFunction of deliveryChain) {
                    //when a different verification channel is used for ACK
                    if (this.messages[ msgId ]._routerData.recvAck === true) break;
                    let result = await new Promise(deliveryFunction)
                    if (result[0] === true) { res(); break; }
                }
                rej()
            })
        ])
        .then(($) => {
            this._clearEventHandlers4MsgID(msgId)
            const dLog = this.messages[ msgId ]._routerData.deliveryLog
            console.log('DELIVERY WAS A SUCCESS', Object.keys(dLog).map(x=>`${ x } is ${ dLog[x] }`).join('\n'))
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