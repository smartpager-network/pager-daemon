const aesjs = require('./aes-64bit')
const crc = require('node-crc')
const crypto = require("crypto")
//console.log(crypto.getCiphers())
function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}
class BOSkrypt {
  constructor() {
  }
  //
  encrypt(payload, key, keyIndex) {
    key = Buffer.from(key, 'hex')
    const iv = Buffer.from([ keyIndex, randomIntInc(0x00, 0xFF), randomIntInc(0x00, 0xFF) ])
    const UNIXNOW = Math.floor(new Date().valueOf()/1e3)
    const timestamp = (UNIXNOW - 1388534400).toString(16).padStart(2*4, '0')
    const ivPadBuffer = Buffer.from("00".repeat(8), 'hex')
    const _ivWithTimestamp = Buffer.from(timestamp + iv.toString('hex'), 'hex')
    const _iv56bitCRC = crc.crc8(_ivWithTimestamp)
    const ivWithTimestamp = Buffer.concat([
      _ivWithTimestamp,
      _iv56bitCRC
    ])
    const ivWithTimestampPadded = Buffer.concat([ ivWithTimestamp, ivPadBuffer ])
    const uncPayloadHash = Buffer.from(crypto.createHash("sha1").update(payload).digest('hex').substring(0,10), 'hex') // first 40bits. 2*40/8

    let preparedPayload = "ENCR" + payload + '\x00'.repeat(
      payload.length < 20
      ? randomIntInc(0,10)
      : 0) // random null-fill

    let compressedPreparedPayload = preparedPayload.split('').map(x => { //foreach char run this
      return x.charCodeAt(0) //get byte
        .toString(2) // to base2/bcd/"binary"
        .padStart(8, '0') // pad to 8 digits (dec4 = 100 => 00000100)
        .split('') // to array
        .reverse() // reverse
        .join('') // back to string
        .substring(0, 7) //take first 7 chars
    }).join('') //join to one complete string

    let compressedPayload = []
    for (let i=0;i<compressedPreparedPayload.length;i+=8) {
      let byte = parseInt(
        compressedPreparedPayload
        .substring(i, i+8) //select 8char chunk from bigstring
        .split('') // to array
        .reverse() // reverse
        .join(''), // back to string
      2) // parse from base2
      compressedPayload.push( byte ) //put in array
    }
    compressedPayload = Buffer.from(compressedPayload)

    const toEncryptData = Buffer.concat([
      uncPayloadHash, compressedPayload
    ])
    let encryptedPayload = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(ivWithTimestampPadded)).encrypt(toEncryptData)
    const encrpytedIncludingIVandSHA1Checksum = Buffer.concat([
      ivWithTimestamp, encryptedPayload
    ])
    return encrpytedIncludingIVandSHA1Checksum.toString('base64')
  }
}
module.exports = new BOSkrypt()