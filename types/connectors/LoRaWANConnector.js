const Connector = require("./Connector")
const config = require('../../config.json')
const md5 = require('md5')

class LoRaWANConnector extends Connector {
  // this is optimized for only receiving LoRa uplink Messages (from Birdy Pagers)

  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "lorawan"
    this.duplexCapable = true
    const MQTT = require('async-mqtt')
    this.client = MQTT.connect(config.connectors.lorawan.mqttserver, {
      username: config.connectors.lorawan.username,
      password: config.connectors.lorawan.password,
    })
    this.client.on('error', (x) => console.error)
    this.client.on('connect', this.onMQTTConnect.bind(this))
    this.client.on('message', this.onMQTTMessage.bind(this))
  }
  async onMQTTConnect() {
    await this.client.subscribe(`v3/${ config.connectors.lorawan.username }/devices/#`)
    await this.client.subscribe(`${ config.connectors.lorawan.username }/devices/#`)
    console.log('[lorawan] subscribed')
  }
  
  async transmitMessage(msg, params) {
    const UUID = this.name+':'+md5(JSON.stringify([this.name,...params]))
    if (params.length < 1) return false
    const target = params[0]
    if (target.split('#').length !== 2) throw 'No valid LoRaWAN Parameter <deviceID#fPort>'
    const deviceID = target.split('#')[ 0 ], fPort = target.split('#')[ 1 ]
    const mqttTopic = `v3/${ config.connectors.lorawan.username }/devices/${ deviceID }/down/push`
    const mqttPayload = {
      downlinks:[
        {
          f_port: fPort,
          frm_payload: Buffer.from(msg.payload, 'utf-8').toString('base64'),
          priority: "NORMAL",
        }
      ]
    }

    console.log (mqttTopic, mqttPayload)
    this.client.publish(mqttTopic, JSON.stringify(mqttPayload))
    .then(() => {
      this.connectorRegistry.reportState(msg, UUID, 'routed')
      return true
    })
    .catch((err) => {
      console.error(err)
      this.connectorRegistry.reportFail(msg, UUID)
      return false
    })
  }
  async onMQTTMessage(topic, message) {
    //if (topic.indexOf('/up') > -1) return
    const json = JSON.parse(Buffer.from(message).toString('utf-8'))
    console.log(topic)
    if (!!json.uplink_message) { // TTN v3
      this.connectorRegistry.events.emit('response', {
        ...json.uplink_message.decoded_payload,
        port: json.uplink_message.f_port,
        date: new Date(json.received_at),
        device_id: json.end_device_ids.device_id,
        metadata: json,
      })
    }
    if (!!json.app_id && json.app_id == config.connectors.lorawan.username) { // TTN v2 
      this.connectorRegistry.events.emit('response', {
        ...json.payload_fields,
        port: json.port,
        date: new Date(json.metadata.time),
        device_id: json.dev_id,
        metadata: json,
      })
    }
  }
}
module.exports = LoRaWANConnector