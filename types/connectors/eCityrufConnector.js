const Connector = require("./Connector")
const config = require('../../config.json')
const md5 = require('md5')
const axios = require('axios')
// [ "ecityruf", "123456789" ]
class eCityrufConnector extends Connector {
  constructor (amqpConnMngr) {
    super(amqpConnMngr)
    this.name = "ecityruf"
    this.duplexCapable = false
    this.supportBOSkrypt = true
  }
  async transmitMessage(msg, params) {
      const UUID = this.name+':'+md5(JSON.stringify([this.name,...params]))
      if (params.length !== 1) return false
      const cityrufRequest = require('querystring').stringify({
        service: 1,
        class: 7,
        language: 'en',
        action: 'SendMessage',
        number: params[ 0 ],
        message: msg.payload,
        lengthAlert: '',
      })
      console.log(cityrufRequest)
      return axios.post('https://inetgateway.emessage.de/cgi-bin/funkruf2.cgi', cityrufRequest, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-User': '?1',
          'Sec-Fetch-Dest': 'document',
          'Referer': 'https://inetgateway.emessage.de/cgi-bin/funkruf2.cgi'
        }
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.indexOf('OK. Your message has been sent') > -1) {
            this.connectorRegistry.reportState(msg, UUID, 'routed')
            return true
          }
        }
        this.connectorRegistry.reportFail(msg, UUID)
        return false
      })
      .catch((err) => {
        console.error(err.response.data)
        this.connectorRegistry.reportFail(msg, UUID)
        return false
      })
  }
}
module.exports = eCityrufConnector