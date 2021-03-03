const Connector = require("./Connector")

class POCSAGConnector extends Connector {
    constructor (amqpConnMngr) {
        super(amqpConnMngr)
        this.name = "pocsag"

        this.channelWrapper = this.amqpConnMngr.createChannel({
            json: false,
            setup: function(channel) {
                return channel.assertQueue('tx_pocsag', { durable: true })
            }
        })
    }
    transmitMessage(msg) {
        if (!msg.ric) return false
        const RIC = msg.ric
        const lastChar = RIC[RIC.length - 1].charCodeAt(0) - 65
        const addressPart = lastChar >= 0 && lastChar <= 3 ? RIC.substring(0, RIC.length - 1) : RIC
        const functionBits = lastChar >= 0 && lastChar <= 3 ? lastChar : 0
        this.channelWrapper.sendToQueue('tx_pocsag', Buffer.from(msg.body), {
            headers: {
                ric: {
                    '!': 'int64',
                    value: addressPart
                },
                function: {
                    '!': 'int64',
                    value: functionBits
                },
            }
        })
        .then(function() {
            return console.log("Message was sent!  Hooray!")
        }).catch(function(err) {
            return console.log(err,"Message was rejected...  Boo!")
        })

    }
  }
  module.exports = POCSAGConnector