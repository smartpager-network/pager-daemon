# pocsag-daemon

[Workflow](https://smartpager.network/Basisfunctionaliteit%20SmartpagerNetwork.pdf)

Features Working rn:
- Duplex and Simplex Processing

Features in W.I.P:
- LoRaWAN progress 0%
- POCSAG only TX , no RX path
- Still missing a RX path and processing (Message gets passed along every Device Class, which then tries to parse it, if successfull it breaks the processing loop and the Device Class handles decoding+status handling for delivery)

Planned:
- WebSocket Live Routing Status