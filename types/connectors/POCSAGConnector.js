const { uuid } = require("@supercharge/strings/dist")
const config = require('../../config.json')
const boskrypt = require('../../boskrypt')
const Connector = require("./Connector")
const md5 = require('md5')

class POCSAGConnector extends Connector {
    constructor (amqpConnMngr) {
        super(amqpConnMngr)
        this.name = "pocsag"
        this.duplexCapable = false
        this.supportBOSkrypt = true
        this.channelWrapper = this.amqpConnMngr.createChannel({
            json: false,
            setup: function(channel) {
                return channel.assertQueue('tx_pocsag', { durable: true })
            }
        })
    }
    async transmitMessage(msg, params) {
        const UUID = this.name+':'+md5(JSON.stringify([this.name,...params]))
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

        let payloadBuffer = Buffer.from(msg.payload)

        const $device = msg.routingParams.device
        // todo centralize this in a encryptionManager to then make it easier to integrate with eCitryruf
        const boskryptSupport = require("../DeviceRegistry").Devices[ $device ].supportBOSkrypt || false
        if (boskryptSupport && !!config.pagers[ $device ] && config.pagers[ $device ].boskrypt.enabled) {
            //payloadBuffer
            const keyTable = config.pagers[ $device ].boskrypt.keys
            if (!!keyTable[ RIC ]) {
                payloadBuffer = Buffer.from(boskrypt.encrypt(payloadBuffer, keyTable[ RIC ], 0))
            }
        }

        this.channelWrapper.sendToQueue('tx_pocsag', payloadBuffer, {
            headers
        })
        .then(() => {
            this.connectorRegistry.reportState(msg, UUID, 'routed')
            return true
        }).catch((err) => {
            this.connectorRegistry.reportFail(msg, UUID)
            return false
        })
    }
  }
  module.exports = POCSAGConnector