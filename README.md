# dispatcher-daemon

[Workflow](https://smartpager.network/Basisfunctionaliteit%20SmartpagerNetwork.pdf)

Features Working rn:
- Duplex and Simplex Processing
- DAPNET integration
- 
Features in W.I.P:
- LoRaWAN progress 70%
- ~~POCSAG only TX , no RX path~~
- ~~Still missing a RX path and processing (Message gets passed along every Device Class, which then tries to parse it, if successfull it breaks the processing loop and the Device Class handles decoding+status handling for delivery)~~

Planned:
- WebSocket Live Routing Status
- more DeviceStats (when LoRaWAN, store Distance to nearest/latest LoRaWAN Gateway of TTN)




API Server running on Port `3000`

API Calls:

| GET `/api/message/ack/recv/<id>` - marks a Message as Delivered

| GET `/api/message/status/<id>` - fetches the current Message Data(DeliveryLog, Payload, etc.)

| GET `/api/device/:` - Lists all Device IDs

| GET `/api/device/<DeviceType>:<ID>` - Returns the Device State.

Example:
> /api/device/birdyslim:test333
```json
{
  "lastSeen": "2021-03-30T10:01:24.988Z",
  "rssi": 34,
  "lastLoRaPacket": {
    "end_device_ids": {
      "device_id": "test333",
      "application_ids": {
        "application_id": "birdy-slim-iot"
      }
    },
    "correlation_ids": [ ... ],
    "received_at": "2021-03-30T10:01:24.988088037Z",
    "uplink_message": {
      "f_port": 5,
      "frm_payload": "AB4z1wBKLDEQ",
      "decoded_payload": {
        "lastGPSAcquisition": 16,
        "latitude": 19.79351,
        "longitude": 48.60977,
        "type": "gps"
      },
      "settings": {
        "data_rate": {}
      },
      "received_at": "0001-01-01T00:00:00Z"
    },
    "simulated": true
  },
  "gps": {
    "gps": {
      "lastGPSAcquisition": 16,
      "latitude": 19.79351,
      "longitude": 48.60977
    }
  }
}
```

| POST `/api/message/advanced` - Creates a new Message and starts delivering it, returns the Message ID. HTTP Body is a JSON Object. for example:
```json
{
    "type": "duplex",
    "routing": {
        "device": "birdyslim",
        "connectors": [
            [ "dummy", "fail" ],
            [ "pocsag", "133701D" ],
            [ "dummy", "works" ]
        ]
    },
    "payload": "Testbericht"
}
```
