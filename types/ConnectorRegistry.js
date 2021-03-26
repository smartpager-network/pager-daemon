const events = require('events')
const md5 = require('md5')

class ConnectorRegistry {
    constructor() {
        this.Connectors = {}
        this.events = new events.EventEmitter()
        this.events.on('ping', (x) => console.log('connector event "ping" from', x))
    }
    register(connector) {
        this.Connectors[ connector.name ] = connector
        connector.Hook(this)
    }
    transmit(name, msg, params) {
        if (!this.Connectors[ name ]) throw "not registred"
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
    receive(id, data) {
    }
}
const registry = new ConnectorRegistry()
module.exports = registry