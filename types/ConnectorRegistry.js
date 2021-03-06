const events = require('events')
const md5 = require('md5')
const DeviceRegistry = require("./DeviceRegistry")

class ConnectorRegistry {
    constructor() {
        this.Connectors = {}
        this.events = new events.EventEmitter()
        this.events.on('ping', (x) => console.log('connector event "ping" from', x))
        this.events.on('response', this.receive.bind(this))
    }
    register(connector) {
        this.Connectors[ connector.name ] = connector
        connector.Hook(this)
    }
    transmit(name, msg, params) {
        if (!this.Connectors[ name ]) {
            setTimeout(this.reportFail.bind(this), 1e3, msg, name)
            return false
        }
        //md5(JSON.stringify([name, ...params])), 
        this.Connectors[ name ].transmitMessage(msg, params)
    }
    supportDuplex(name) {
        if (!this.Connectors[ name ]) throw "not registred"
        return this.Connectors[ name ].duplexCapable
    }

    reportState(msg, uuid, state) {
        this.events.emit(`msg:status`, msg.id, uuid, state)
    }
    reportFail(msg, uuid) {
        this.events.emit(`msg:status:${ msg.id }:failed`)
        this.reportState(msg, uuid, 'failed')
    }
    reportDelivered(msg, uuid) {
        this.events.emit(`msg:status:${ msg.id }:delivered`, msg, uuid)
        this.reportState(msg, uuid, 'delivered')
    }


    //W.I.P
    async receive(data, connector) {
        for (let device of DeviceRegistry.getDevices()) {
            if (await device.tryReceive(data, connector) === true) { break; }
        }
    }
}
const registry = new ConnectorRegistry()
module.exports = registry