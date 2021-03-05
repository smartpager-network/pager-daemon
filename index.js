const amqp = require('amqp-connection-manager')

// Create a connetion manager
const connection = amqp.connect([
    'amqp://daemon:daemon@10.13.37.37:5672/'
])
connection.on('connect', () => console.log('Connected to AMQP.'))
connection.on('disconnect', err => console.log('Disconnected from AMQP.', err.stack))

const types = require('./types') // also initializes the registries, if they havent been loaded
types.ConnectorRegistry.register(new types.Connectors.POCSAGConnector(connection)) // activate POCSAG

types.DeviceRegistry.register(new types.devices.GenericPager())
types.DeviceRegistry.register(new types.devices.BirdySlim())
types.DeviceRegistry.register(new types.devices.Skyper())

const skyperTest = [/*
"0004520:Skyper: 5B 20 Quelle: www.pegelonline.wsv.de",
"0004520:Skyper: 5B 21 Main: 25.02.21 21:30 Frankfurt Osthafen 171.0cm Trend:gleich MNW:normal",
"0004520:Skyper: 27 20 SFI 80 SN 33 A 13 K 3 MUF 17.38X-RayA5.3 (N0NBH: hamqsl.com)",
"0004520:Skyper: 24 20 70154.0 ON5XY von DL8BDU um 1523z",
"0004520:Skyper: 24 23 50313.0 DK1MAX von DF5VAE um 1051z",
"0004520:Skyper: 22 20 7160.0 9K60OD von PA3HFH um 2156z",
"0004520:Skyper: 22 22 7157.5 CN8ZG von OK2BVE um 2129z",
"0004520:Skyper: 22 23 3744.0 DG1KK von DL3JH um 2133z",
"0004520:Skyper: 26 20 7009.5 AA3B von DL1ERE um 2133z",
"0004520:Skyper: 26 21 3504.9 YR0UCRR von DF4IY um 2200z",
"0004520:Skyper: 26 23 3548.9 G3PDH von OK1FJD um 2117z",
"0004520:Skyper: 26 24 3550.0 G7X von OK1FJD um 2123z",
"0004520:Skyper: 26 24 3550.0 G7X von OK1FJD um 2123z",
"0004520:Skyper: 71 20 Feinstaub Warnung fuer 2.5um in Frankfurt. Im Durchschnitt 25.7241 ug/m3.",
"0004520:Skyper: 71 21 Feinstaub Warnung fuer 2.5um in Wiesbaden. Im Durchschnitt 25.3800 ug/m3.",
"0004520:Skyper: 71 22 Feinstaub Warnung fuer 2.5um in Kassel. Im Durchschnitt 33.7351 ug/m3.",
"0004520:Skyper: 63 20 26736 Krummhörn Ortsdosisleistung 0,08 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 21 22335 Hamburg Ortsdosisleistung 0,064 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 22 17406 Usedom Ortsdosisleistung 0,062 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 23 50259 Pulheim Ortsdosisleistung 0,082 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 24 38116 Braunschweig Ortsdosisleistung 0,079 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 25 12101 Berlin-TempelhOrtsdosisleistung 0,068 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 26 66128 Saarbrücken Ortsdosisleistung uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 27 99099 Erfurt Ortsdosisleistung 0,105 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 28 79761 Waldshut Ortsdosisleistung 0,085 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 29 Zugspitze Ortsdosisleistung 0,117 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 23 20 144435.0 DB0LBV/B von OK1SC um 1718z",
"0004520:Skyper: 23 21 144444.0 DB0FGB/B von OK1SC um 1718z",
"0004520:Skyper: 23 22 432073.0 SM3KPX von PA2V um 2028z",
"0004520:Skyper: 23 22 432073.0 SM3KPX von PA2V um 2028z",
"0004520:Skyper: 23 23 144174.0 G8ECI von PD0HCV um 2122z",
"0004520:Skyper: 23 24 144460.0 HG1BVA/B von OK1SC um 1717z",
"0004520:Skyper: 55 20 NEW DAPNET Ticket 111",
"0004520:Skyper: 55 21 NEW DAPNET Ticket New dapnet account",
"0004520:Skyper: 55 22 NEW DAPNET Ticket New DAP member",
"0004520:Skyper: 55 23 NEW DAPNET Ticket New DAPNET Account with RIC",
"0004520:Skyper: 55 24 NEW DAPNET Ticket join",
"0004520:Skyper: 55 24 NEW DAPNET Ticket join",
"0004520:Skyper: 55 25 NEW DAPNET Ticket New Pi-Star",
"0004520:Skyper: 55 26 NEW DAPNET Ticket Re-activating my mmdvm hs dual hat for dapnet",
"0004520:Skyper: 55 27 NEW DAPNET Ticket Frage zu Rubriken, alternative benutzung Skyper",
"0004520:Skyper: 55 28 NEW DAPNET Ticket New User",
"0004520:Skyper: 55 29 NEW DAPNET Ticket Add Transmitter",
"0004520:Skyper: 6F 24 25.02.21 05:39 - 07:00z: NEBEL",
"0004520:Skyper: 6F 25 25.02.21 06:48 - 08:00z: NEBEL",
"0004520:Skyper: 60 20 2252 CET DB0PET-13/Fulda: 8.9C w: 0.0m/s at 1deg h: 61% rain: 0.0mm/h",
"0004520:Skyper: 5A 20 DXCluster bei DB0SDAges:500 KW:182 KWCW:105 4/6m:13 V/UHF:12 SHF:10",
"0004520:Skyper: 5A 21 DAPNET-Core Stats PrivMsgs:1329 News:523Nodes:7/9 TXs:662/2263",
"0004520:Skyper: 5A 22 Spot Stats: SOTA:288, WWFF:83, COTA:16, IOTA:0, GMA:80",
"0004520:Skyper: 25 20 1296220.0 IU4MES von DK3SE um 2037z",
"0004520:Skyper: 25 21 1296923.0 DB0AAT/B von DK1PZ um 1527z",
"0004520:Skyper: 25 24 3400840.0 OK0EA von DL4DTU um 1648z",
"0004520:Skyper: 5C 20 EDDB 252120Z 23004KT CAVOK 08/06 Q1026 NOSIG",
"0004520:Skyper: 5C 21 EDDF 252050Z 15002KT CAVOK 07/03 Q1027 NOSIG",
"0004520:Skyper: 5C 22 EDDH 252050Z 28004KT 9999 FEW045 08/06 Q1027 NOSIG",
"0004520:Skyper: 5C 23 EDDM 252050Z 30001KT CAVOK 04/03 Q1029 NOSIG",
"0004520:Skyper: 5C 24 EDDL 252050Z 34010KT CAVOK 12/09 Q1028 NOSIG",
"0004520:Skyper: 5C 25 EDDS 252050Z 27005KT CAVOK 07/04 Q1029 NOSIG",
"0004520:Skyper: 5C 26 EDDV 252050Z 32002KT CAVOK 09/06 Q1026 NOSIG",
"0004520:Skyper: 5C 27 EDDP 252050Z 19005KT CAVOK 10/06 Q1027 NOSIG",
"0004520:Skyper: 5C 28 EDDR 252050Z 23004KT CAVOK 11/00 Q1028 NOSIG",
"0004520:Skyper: 5C 29 EDDN 252050Z 10004KT CAVOK 09/03 Q1028 NOSIG",
"0004520:Skyper: 3A 20 ARRL: ARRL Interview Explains Background of Ham Radio in Space Film Short",
"0004520:Skyper: 3A 21 OEVSV: Deutschland-Rundspruch 8/2021, 8. KW",
"0004520:Skyper: 3A 22 ARRL: Wildlife Outnumber Participants in Winter Yellowstone VHF Radio Rally",
"0004520:Skyper: 3A 23 ISSFC: <FS>Space Symphony<GS>, the official anthem of the ESA mission <FS>Cosmic Kiss<GS>",
"0004520:Skyper: 3A 25 UBA: UBA Contest (CW)",
"0004520:Skyper: 3A 26 DARC: Tianwen-1-Empfang von der Sternwarte Bochum auf YouTube verfügbar",
"0004520:Skyper: 3A 27 SWLING: VisAir SDR Transceiver: Randy purchased one exclusively for shortwave ra",
"0004520:Skyper: 3A 28 SWLING: VisAir HF DDC/DUC Transceiver: Randy purchased one exclusively for short",
"0004520:Skyper: 3A 29 ARRL: Amateur Radio Helping to Fill Earthquake Report <FS>Donut Holes<GS>",
"0004520:Skyper: 51 20 ISS: Feb 26 02:57:39Duration: 9:10 min",
"0004520:Skyper: 51 21 ISS: Feb 26 04:33:05Duration: 10:47 min",
"0004520:Skyper: 51 22 ISS: Feb 26 06:09:47Duration: 10:55 min",
"0004520:Skyper: 51 23 ISS: Feb 26 07:46:40Duration: 10:55 min",
"0004520:Skyper: 51 24 ISS: Feb 26 09:23:31Duration: 10:13 min",
"0004520:Skyper: 22 21 7124.0 7X2GK von PA3HFH um 2201z",
"0004520:Skyper: 26 22 1822.5 HL5IVL von OK1IW um 2205z",
"0004520:Skyper: 51 20 ISS: Feb 26 02:57:39Duration: 9:10 min",
"0001051:Skyper: 51 20 ISS: Feb 26 02:57:39Duration: 9:10 min",
"0004520:Skyper: 51 21 ISS: Feb 26 04:33:05Duration: 10:47 min",
"0004520:Skyper: 51 22 ISS: Feb 26 06:09:47Duration: 10:55 min",
"0004520:Skyper: 51 23 ISS: Feb 26 07:46:40Duration: 10:55 min",
"0004520:Skyper: 60 20 2311 CET DB0PET-13/Fulda: 8.9C w: 0.0m/s at 0deg h: 58% rain: 0.0mm/h",
"0004520:Skyper: 5C 20 EDDB 252150Z 23004KT CAVOK 08/06 Q1026 NOSIG",
"0004520:Skyper: 5C 21 EDDF 252150Z 20003KT CAVOK 06/03 Q1028 NOSIG",
"0004520:Skyper: 5C 22 EDDH 252150Z 30008KT 9999 -RA BKN040 08/06 Q1027 NOSIG",
"0004520:Skyper: 5C 23 EDDM 252150Z VRB01KT CAVOK 01/00 Q1029 NOSIG",
"0004520:Skyper: 5C 24 EDDL 252150Z 33006KT 9999 FEW012 BKN046 11/09 Q1028 NOSIG",
"0004520:Skyper: 5C 25 EDDS 252150Z 28004KT CAVOK 06/03 Q1029 NOSIG",
"0004520:Skyper: 5C 26 EDDV 252150Z 35008KT 9999 -RA FEW012 SCT045 OVC060 10/08 Q1027",
"0004520:Skyper: 5C 27 EDDP 252150Z 20006KT CAVOK 09/06 Q1027 NOSIG",
"0004520:Skyper: 5A 21 DAPNET-Core Stats PrivMsgs:1361 News:524Nodes:7/9 TXs:661/2263",
"0004520:Skyper: 27 20 SFI 80 SN 33 A 13 K 3 MUF 18.24X-RayA5.3 (N0NBH: hamqsl.com)",
"0004520:Skyper: 5B 20 Quelle: www.pegelonline.wsv.de",
"0004520:Skyper: 5B 21 Main: 25.02.21 23:30 Frankfurt Osthafen 177.0cm Trend:gleich MNW:normal",
"0004520:Skyper: 60 20 2331 CET DB0PET-13/Fulda: 10.0C w: 0.0m/s at 30deg h: 55% rain: 0.0mm/h",
"0004520:Skyper: 71 22 Feinstaub Entwarnung fuer 2.5um in Kassel. Im Durchschnitt 7.7091 ug/m3.",
"0004520:Skyper: 5C 20 EDDB 252220Z 22003KT 190V250 CAVOK 07/05 Q1026 NOSIG",
"0004520:Skyper: 5C 21 EDDF 252220Z VRB02KT CAVOK 05/03 Q1028 NOSIG",
"0004520:Skyper: 5C 22 EDDH 252220Z 29006KT 9999 FEW045 07/06 Q1027 NOSIG",
"0004520:Skyper: 5C 23 EDDM 252220Z 23002KT CAVOK 01/00 Q1029 NOSIG",
"0004520:Skyper: 5C 24 EDDL 252220Z 34006KT 9999 FEW007 SCT011 11/09 Q1028 BECMG BKN010",
"0004520:Skyper: 5A 21 DAPNET-Core Stats PrivMsgs:60 News:497Nodes:7/9 TXs:657/2263",
"0004520:Skyper: 27 20 SFI 80 SN 33 A 13 K 3 MUF 17.48X-RayA5.3 (N0NBH: hamqsl.com)",
"0004520:Skyper: 60 20 2351 CET DB0PET-13/Fulda: 8.3C w: 0.0m/s at 270deg h: 63% rain: 0.0mm/h",
"0004520:Skyper: 30 24 ## NEWS-Distrikt H > Niedersachsen-Rundspruch 8/2021 @ 25.02.21 17:56",
"0004520:Skyper: 30 25 ## Termine Distrikt H (https://dc7os.darc.de) # 25.02.21 07:55 via DB0USD ##",
"0004520:Skyper: 30 26 ## Heute keine Termine ;-) mehr Zeit zum Funken ## Terminvorschau: ",
"0004520:Skyper: 30 27 03.03.21 H35: Abgabe Prot. # Bitte an darc@darc.de und dv_h@lists.darc.de send..",
"0004520:Skyper: 30 28 06.03.21 H35: AFu-Kurs Klasse E, Online # Kursgebuehren 50,",
"0004520:Skyper: 30 29 09.03.21 H: QSL-Versand aus Baunatal ",
"0004520:Skyper: 28 20 1841.2 ZA/IW2JOP von OK1DWQ um 2135z",
"0004520:Skyper: 28 21 3573.0 BD7BS von DO1KHW um 2237z",
"0004520:Skyper: 28 22 7047.0 VP8LP von PA1MVL um 2246z",
"0004520:Skyper: 28 23 3573.0 ON4MDW von DO4DOC um 2008z",
"0004520:Skyper: 28 24 10137.0 DP1POL von DH9OK um 2135z",
"0004520:Skyper: 6E 20 2030z EDDF/Frankfurt: 6.7C w: 0.4m/s=0deg h: 75% hPa: 1027.0 ",
"0004520:Skyper: 6E 21 2035z EW0954/Bebra: 7.2C w: no h: 82% hPa: 1029.3 r: 0.0mm/h",
"0004520:Skyper: 6E 22 2040z DW8965/Cornberg: 4.4C w: no h: 87% hPa: 1018.4 r: 0.0mm/h",
"0004520:Skyper: 6E 23 2032z DB0PET-13/Fulda: 10.0C w: no h: 59% hPa: 1028.5 r: 0.0mm/h",
"0004520:Skyper: 6E 24 2035z DG3FBL-13/Moerfelden: 7.2C w: no h: 53% hPa: 1023.2 r: 0.0mm/h",
"0004520:Skyper: 6E 25 2033z DB0REI-10/Gruenberg: 12.2C w: no h: 56% hPa: 998.7 r: 0.0mm/h",
"0004520:Skyper: 5B 20 Quelle: www.pegelonline.wsv.de",
"0004520:Skyper: 5B 21 Main: 25.02.21 23:30 Frankfurt Osthafen 177.0cm Trend:gleich MNW:normal",
"0004520:Skyper: 27 20 SFI 80 SN 33 A 13 K 3 MUF 17.48X-RayA5.3 (N0NBH: hamqsl.com)",
"0004520:Skyper: 24 20 70154.0 ON5XY von DL8BDU um 1523z",
"0004520:Skyper: 24 21 70095.0 PA0AG/B von DL6BF um 1532z",
"0004520:Skyper: 24 23 50313.0 DK1MAX von DF5VAE um 1051z",
"0004520:Skyper: 22 20 7074.3 DP1POL von PA1MVL um 2219z",
"0004520:Skyper: 22 21 5357.0 A71AE von PE4BAS um 2223z",
"0004520:Skyper: 22 23 7124.0 7X2GK von OK2BVE um 2208z",
"0004520:Skyper: 22 24 3786.0 DO2IS von DL3JH um 2216z",
"0004520:Skyper: 26 20 7009.5 AA3B von DL1ERE um 2133z",
"0004520:Skyper: 26 22 1822.5 HL5IVL von OK1IW um 2205z",
"0004520:Skyper: 71 20 Feinstaub Warnung fuer 2.5um in Frankfurt. Im Durchschnitt 25.7241 ug/m3.",
"0004520:Skyper: 71 21 Feinstaub Warnung fuer 2.5um in Wiesbaden. Im Durchschnitt 25.3800 ug/m3.",
"0004520:Skyper: 71 22 Feinstaub Entwarnung fuer 2.5um in Kassel. Im Durchschnitt 7.7091 ug/m3.",
"0004520:Skyper: 63 20 26736 Krummhörn Ortsdosisleistung 0,08 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 22 17406 Usedom Ortsdosisleistung 0,062 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 23 50259 Pulheim Ortsdosisleistung 0,082 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 25 12101 Berlin-TempelhOrtsdosisleistung 0,068 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 26 66128 Saarbrücken Ortsdosisleistung uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 27 99099 Erfurt Ortsdosisleistung 0,105 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 28 79761 Waldshut Ortsdosisleistung 0,085 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 63 29 Zugspitze Ortsdosisleistung 0,117 uSv/h (von odlinfo.bfs.de)",
"0004520:Skyper: 23 20 144435.0 DB0LBV/B von OK1SC um 1718z",
"0004520:Skyper: 23 21 144444.0 DB0FGB/B von OK1SC um 1718z",
"0004520:Skyper: 23 22 432073.0 SM3KPX von PA2V um 2028z",
"0004520:Skyper: 23 23 144174.0 G8ECI von PD0HCV um 2122z",
"0004520:Skyper: 23 24 144460.0 HG1BVA/B von OK1SC um 1717z",
"0004520:Skyper: 55 21 NEW DAPNET Ticket New dapnet account",
"0004520:Skyper: 55 21 NEW DAPNET Ticket New dapnet account",
"0004520:Skyper: 55 22 NEW DAPNET Ticket New DAP member",
"0004520:Skyper: 55 23 NEW DAPNET Ticket New DAPNET Account with RIC",
"0004520:Skyper: 6F 24 25.02.21 05:39 - 07:00z: NEBEL",
"0004520:Skyper: 6F 25 25.02.21 06:48 - 08:00z: NEBEL",
"0004520:Skyper: 60 20 2351 CET DB0PET-13/Fulda: 8.3C w: 0.0m/s at 270deg h: 63% rain: 0.0mm/h",
"0004520:Skyper: 5A 20 DXCluster bei DB0SDAges:500 KW:182 KWCW:105 4/6m:13 V/UHF:12 SHF:10",
"0004520:Skyper: 5A 21 DAPNET-Core Stats PrivMsgs:60 News:497Nodes:7/9 TXs:657/2263",
"0004520:Skyper: 5A 22 Spot Stats: SOTA:288, WWFF:83, COTA:16, IOTA:0, GMA:80",
"0004520:Skyper: 25 20 1296220.0 IU4MES von DK3SE um 2037z",
"0004520:Skyper: 25 24 3400840.0 OK0EA von DL4DTU um 1648z",
"0004520:Skyper: 5C 20 EDDB 252220Z 22003KT 190V250 CAVOK 07/05 Q1026 NOSIG",
"0004520:Skyper: 5C 21 EDDF 252220Z VRB02KT CAVOK 05/03 Q1028 NOSIG",
"0004520:Skyper: 5C 22 EDDH 252220Z 29006KT 9999 FEW045 07/06 Q1027 NOSIG",
"0004520:Skyper: 5C 23 EDDM 252220Z 23002KT CAVOK 01/00 Q1029 NOSIG",
"0004520:Skyper: 5C 24 EDDL 252220Z 34006KT 9999 FEW007 SCT011 11/09 Q1028 BECMG BKN010",
"0004520:Skyper: 5C 25 EDDS 252150Z 28004KT CAVOK 06/03 Q1029 NOSIG",
"0004520:Skyper: 5C 26 EDDV 252150Z 35008KT 9999 -RA FEW012 SCT045 OVC060 10/08 Q1027",
"0004520:Skyper: 5C 27 EDDP 252150Z 20006KT CAVOK 09/06 Q1027 NOSIG",
"0004520:Skyper: 5C 29 EDDN 252150Z 11003KT CAVOK 06/03 Q1028",
"0004520:Skyper: 3A 20 ARRL: ARRL Interview Explains Background of Ham Radio in Space Film Short",
"0004520:Skyper: 3A 21 OEVSV: Deutschland-Rundspruch 8/2021, 8. KW",
"0004520:Skyper: 3A 22 ARRL: Wildlife Outnumber Participants in Winter Yellowstone VHF Radio Rally",
"0004520:Skyper: 3A 23 ISSFC: <FS>Space Symphony<GS>, the official anthem of the ESA mission <FS>Cosmic Kiss<GS>",
"0004520:Skyper: 3A 24 SARC: The Royal Australian Air Force - 100 Year Centenary. VK100AF and VI100AF",
"0004520:Skyper: 3A 25 UBA: UBA Contest (CW)",
"0004520:Skyper: 3A 26 DARC: Tianwen-1-Empfang von der Sternwarte Bochum auf YouTube verfügbar",
"0004520:Skyper: 3A 27 SWLING: VisAir SDR Transceiver: Randy purchased one exclusively for shortwave ra",
"0004520:Skyper: 3A 28 SWLING: VisAir HF DDC/DUC Transceiver: Randy purchased one exclusively for short",*/

/*"0004512:0x30 32 )Rheinland-P",
"0004512:Skyper: 30 65 )OV Info F73",
"0004512:Skyper: 30 6D )AFU Petersb",
"0004512:Skyper: 30 37 )Thueringen",
"0004512:Skyper: 30 36 )Sachsen-Anh",
"0004512:Skyper: 30 30 )Niedersachs",
"0004512:Skyper: 30 31 )Nordrhein-W",
"0004512:Skyper: 30 28 )DX Digimode",
"0004512:Skyper: 30 74 )OV DARC R20",
"0004512:Skyper: 30 74 )OV DARC R20",
"0004512:Skyper: 30 50 )Spots COTA",
"0004512:Skyper: 30 2F )Mecklenburg",
"0004512:Skyper: 30 5B )Pegel-Lokal",
"0004512:Skyper: 30 27 )Conditions",
"0004512:Skyper: 30 4F )Spots WWFF",
"0004512:Skyper: 30 4B )Alle Spots",
"0004512:Skyper: 30 71 )Feinstaub",
"0004512:Skyper: 30 23 )DX 144/430",
"0004512:Skyper: 30 4D )Spots GMA",
"0004512:Skyper: 30 55 )DAPNET Team",
"0004512:Skyper: 30 6F )DWD-Alerts",
"0004512:Skyper: 30 60 )HE-Ost-Info",
"0004512:Skyper: 30 2A )Baden-Wuert",
"0004512:Skyper: 30 5A )Statistiken",
"0004512:Skyper: 30 38 )Brandenburg",
"0004512:Skyper: 30 4E )Spots IOTA",
"0004512:Skyper: 30 4C )Spots SOTA",
"0004512:Skyper: 30 3B )VHFDXAlerts",
"0004512:Skyper: 30 3A )Club-News",
"0004512:Skyper: 30 5D )METAR-Lokal",
"0004512:Skyper: 30 62 )Kassel-Info",
"0004512:Skyper: 30 49 )GOE Notfunk",
"0004512:Skyper: 30 51 )Satelliten",*//*
"0004520:Skyper: 5A 20 DXCluster bei DB0SDAges:0 KW:0 KWCW:0 4/6m:0 V/UHF:0 SHF:0",
"0004520:Skyper: 60 20 0011 CET DB0PET-13/Fulda: 9.4C w: 0.0m/s at 270deg h: 58% rain: 0.0mm/h",
"0004520:Skyper: 5C 20 EDDB 252250Z 23005KT CAVOK 07/05 Q1026 NOSIG",
"0004520:Skyper: 5C 21 EDDF 252250Z 21002KT CAVOK 04/02 Q1028 NOSIG",
"0004520:Skyper: 5C 22 EDDH 252250Z 30006KT 9999 BKN045 07/06 Q1028 NOSIG",
"0004520:Skyper: 5C 23 EDDM 252250Z VRB01KT CAVOK 00/M00 Q1029 NOSIG",
"0004520:Skyper: 5C 24 EDDL 252250Z 34005KT 9999 FEW007 BKN011 11/09 Q1029 NOSIG",
"0004520:Skyper: 5C 26 EDDV 252250Z 31007KT 280V340 9000 -RA FEW010 SCT032 OVC060 09/08 Q1028 RERA",
"0004520:Skyper: 5C 27 EDDP 252250Z 20005KT CAVOK 10/05 Q1027 NOSIG",
"0004520:Skyper: 5A 20 DXCluster bei DB0SDAges:0 KW:0 KWCW:0 4/6m:0 V/UHF:0 SHF:0",*/
]
/**
 * Calculates a Skyper activation key
 *
 * @param ric Skyper RIC as string
 * @param year Expiration year as number
 * @returns the Skyper activation key as string
 */
function calculateSkyperKey(ric, month, year) {
    // Calculate start string based on known constant string and
    // given month and year
    const startString = '0 ' + ((300200 + (month * 1000)) + (year - 2000)).toString();
  
    // Calculate substitution key from RIC
    const substitutionKey = (ric % 8) + 2;
  
    // Add substitution key to every ASCII char from the start string
    key = startString.split('').map((char) => {
      return String.fromCharCode(char.charCodeAt(0) + substitutionKey);
    }).join('');
  
    return key;
}
function skyperActivation(RIC) { // send with functioncode C(2)
    let activationMsg = ""
    let activationSequences = [[0,7,50],[0,7,34],[0,7,53],[0,7,51],[0,7,51],[0,7,52],[0,7,52],[0,7,56]]
    for(let activationSequence of activationSequences) {
        activationMsg += String.fromCharCode(((RIC >> activationSequence[0]) & activationSequence[1]) + activationSequence[2])
    }
    return activationMsg
}
async function main2() {
    let skyperTest = []/*
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 1) + String.fromCharCode(0x20 + 10) + "Rubrik 1")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 2) + String.fromCharCode(0x20 + 10) + "Rubrik 2")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 3) + String.fromCharCode(0x20 + 10) + "Rubrik 3")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 4) + String.fromCharCode(0x20 + 10) + "Rubrik 4")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 5) + String.fromCharCode(0x20 + 10) + "Rubrik 5")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 6) + String.fromCharCode(0x20 + 10) + "Rubrik 6")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 7) + String.fromCharCode(0x20 + 10) + "Rubrik 7")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 8) + String.fromCharCode(0x20 + 10) + "Rubrik 8")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 9) + String.fromCharCode(0x20 + 10) + "Rubrik 9")
    skyperTest.push('4512:1' + String.fromCharCode(0x1f + 10) + String.fromCharCode(0x20 + 10) + "Rubrik 10")

    skyperTest.push('4520:1' + String.fromCharCode(0x1f + 1) + String.fromCharCode(0x20 + 0) + "Rubrik 1 Nachricht Slot 0")
    skyperTest.push('4520:1' + String.fromCharCode(0x1f + 2) + String.fromCharCode(0x20 + 1) + "Rubrik 2 Nachricht Slot 1")
    skyperTest.push('4520:1' + String.fromCharCode(0x1f + 3) + String.fromCharCode(0x20 + 2) + "Rubrik 3 Nachricht Slot 2")
    skyperTest.push('4520:1' + String.fromCharCode(0x1f + 4) + String.fromCharCode(0x20 + 3) + "Rubrik 4 Nachricht Slot 3")
    skyperTest.push('4520:1' + String.fromCharCode(0x1f + 5) + String.fromCharCode(0x20 + 4) + "Rubrik 5 Nachricht Slot 4")
    for (let line of skyperTest) {
        const addr = line.split(':')[0]
        let id = await types.MessageManager.New('simple', {
            device: 'skyper',
            skyperNetwork: true,
            connectors: [
                ['pocsag', addr+'D']
            ],
        }, line.substr(addr.length+1+ 9*0))
        await types.MessageManager.Deliver(id)
    }
    */
/*
    let id2 = await types.MessageManager.New('simple', { device: 'generic', connectors: [
        ['pocsag', '077174D']
    ] }, "Netwerktestbericht")
    console.log('msgid', id2)
    await types.MessageManager.Deliver(id2)
*/
    // activating the skyper
    const routingHeader = {
        device: 'skyper',
        connectors: [
            ['pocsag', '077174C']
        ],
    }
    //for (var i = 0; i < 8; i++)
        /*await types.MessageManager.Deliver(
            await types.MessageManager.New('simple', routingHeader, calculateSkyperKey(8, 11, 2022))
        )*/
    
    /*
    // Skyper Time things
    let t = "213000   040321"
    for (var i=0;i<8;i++) {
        let id = await types.MessageManager.New('simple', {
            device: 'skyper',
            connectors: [
                ['pocsag', '2504A', true], // enable numeric mode
            ],
        }, t)
        console.log('msgid', id)
        await types.MessageManager.Deliver(id)
    }*/
}

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
/*app.get('/api/message/easy', async (req, res) => {})*/
app.get('/api/message/advanced', async (req, res) => {
    if (!req.body.type) return res.status(500).json("ERROR: no msg type(simple,duplex)")
    if (!req.body.payload) return res.status(500).json("ERROR: no msg payload")
    if (!req.body.routing) return res.status(500).json("ERROR: no msg routing")

    let id = await types.MessageManager.New(req.body.type, req.body.routing, req.body.payload)
    await types.MessageManager.Deliver(id)
    return res.json(id)
})
main2()
/**{
    device: 'skyper',
    skyperNetwork: true,
    connectors: [
        ['pocsag', addr+'D']
    ],
} */
app.listen(3000)