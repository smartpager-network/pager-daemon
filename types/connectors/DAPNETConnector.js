const Connector = require("./Connector")
const config = require('../../config.json')
const md5 = require('md5')
const axios = require('axios')

class DAPNETConnector extends Connector {
  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "dapnet"
    this.duplexCapable = false
  }
  async transmitMessage(msg, params) {
      const UUID = this.name+':'+md5(JSON.stringify([this.name,...params]))
      if (params.length < 1) return false
      const target = params[0]
      if (target.split('#').length !== 2) throw 'No valid DAPNET Parameter <transmitterGroup#callSign>'
      const transmitterGroup = target.split('#')[ 0 ], callsign = target.split('#')[ 1 ]
      const dapnetRequest = {
        text: msg.payload,
        callSignNames: [ callsign ],
        transmitterGroupNames: [ transmitterGroup ]
      }
      const extraParameters = {
        auth: {
          username: config.connectors.dapnet.username,
          password: config.connectors.dapnet.password
        }
      }
      // console.log(config.connectors.dapnet.endpoint, dapnetRequest, extraParameters)
      return axios.post(config.connectors.dapnet.endpoint, dapnetRequest, extraParameters)
      .then(() => {
        this.connectorRegistry.reportState(msg, UUID, 'routed')
        return true
      })
      .catch((err) => {
        console.error(err.response.data)
        this.connectorRegistry.reportFail(msg, UUID)
        return false
      })
  }
}
module.exports = DAPNETConnector