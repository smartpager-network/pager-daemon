# dispatcher-daemon

[Workflow](https://smartpager.network/Basisfunctionaliteit%20SmartpagerNetwork.pdf)

Features Working rn:
- Duplex and Simplex Processing

Features in W.I.P:
- LoRaWAN progress 70%
- POCSAG only TX , no RX path
- ~~Still missing a RX path and processing (Message gets passed along every Device Class, which then tries to parse it, if successfull it breaks the processing loop and the Device Class handles decoding+status handling for delivery)~~

Planned:
- DAPNET integration
- WebSocket Live Routing Status



API Server running on Port `3000`

API Calls:

| GET `/api/message/ack/recv/<id>` - marks a Message as Delivered

| GET `/api/message/status/<id>` - fetches the current Message Data(DeliveryLog, Payload, etc.)

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
