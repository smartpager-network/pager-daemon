const Connector = require("./Connector")

class POCSAGConnector extends Connector {
    constructor (amqpConnMngr) {
        super(amqpConnMngr)
        this.name = "pocsag"
        this.duplexCapable = true
        this.channelWrapper = this.amqpConnMngr.createChannel({
            json: false,
            setup: function(channel) {
                return channel.assertQueue('tx_pocsag', { durable: true })
            }
        })
    }
    async transmitMessage(msg, params) {
        if (params.length < 1) return false
        const RIC = params[0]
        const lastChar = RIC[RIC.length - 1].charCodeAt(0) - 65
        const addressPart = lastChar >= 0 && lastChar <= 3 ? RIC.substring(0, RIC.length - 1) : RIC
        const functionBits = lastChar >= 0 && lastChar <= 3 ? lastChar : 0

        const headers = {
            ric: {
                '!': 'int64',
                value: addressPart
            },
            function: {
                '!': 'int64',
                value: functionBits
            },
        }
        if (params.length >= 2 && params[1] === true) headers.numeric = 1
        this.channelWrapper.sendToQueue('tx_pocsag', Buffer.from(msg.payload), {
            headers
        })
        .then(function() {
            return true
        }).catch(function(err) {
            return false
        })
    }
  }
  module.exports = POCSAGConnector