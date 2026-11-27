

# IRIS S2S Protokolla

**iris käyttää tällä hetkellä protocolla v1 versiota, ei projektissa myös olevaa v2 versiota vielä**.

**IRIS-S2S-protokolla** on IRIS IRC:tä varten suunniteltu palvelinten välinen protokolla, **ei** IRC-clientin protokolla..

Sen tarkoituksena on tarjota selkeä perusta itsenäisten IRIS-palvelinten väliselle kommunikaatiolle 
ja samalla mahdollistaa protokollan kehittäminen riippumatta perinteisen IRC-client-protokollan rajoituksista.

IRIS rakentuu rakenteisten **binäärikehysten** ja eksplisiittisten protokollatilojen ympärille.

Nykyisiä protokollan konsepteja ovat muun muassa:


| Ominaisuus | Arvo |
|---|---|
| Protokolla | IRIS-S2S |
| Tyyppi | Binääriprotokolla |
| Header | 32 tavua |
| Maksimi payload | 1 MB |
| Chunk-koko | 64 KiB |
| ACK | Käytössä |
| Handshake timeout | 10 s |
| Connection queue | 1000 |
| Server ID | `iris-01` (Jokaisella IRIS-palvelimella on oma tunnisteensa) |
| Server role | `hub` |
| Message ID | Käytössä |
| Multi-server | Käytössä |
| Channel sync | Käytössä |
| CLIENT-propagointi | esim. `iris-03 → iris-02 → iris-01` |
| Käyttötarkoitus | Hajautettu IRIS-verkko |

## Viestityypit


### **Viestityypit**

**Yhteyden muodostaminen ja tunnistautuminen**

| Type   | Code   |
| ------ | ------ |
| HELLO  | `0x01` |
| AUTH   | `0x02` |
| SERVER | `0x03` |
| READY  | `0x04` |

**Palvelimen ja käyttäjän hallinta**

| Type   | Code   |
| ------ | ------ |
| CLIENT | `0x10` |
| NICK   | `0x11` |
| QUIT   | `0x12` |

**Kanavatoiminnot**

| Type  | Code   |
| ----- | ------ |
| JOIN  | `0x20` |
| PART  | `0x21` |
| KICK  | `0x22` |
| MODE  | `0x23` |
| TOPIC | `0x24` |

**Viestinvälitys**

| Type    | Code   |
| ------- | ------ |
| MESSAGE | `0x30` |
| NOTICE  | `0x31` |

**Yhteyden ylläpito ja kuittaukset**

| Type | Code   |
| ---- | ------ |
| PING | `0x40` |
| PONG | `0x41` |
| ACK  | `0x42` |


```text

                    IRIS S2S PROTOCOL
                           │
                           │
             ┌─────────────┴─────────────┐
             │                           │
        ┌────▼────┐                 ┌────▼────┐
        │ iris-01 │                 │ iris-02 │
        │  IRCd   │                 │  IRCd   │
        └────┬────┘                 └────┬────┘
             │                            │
             │◄────── S2S frames ───────►│
             │                            │
             │   HELLO / AUTH / SERVER   │
             │   READY / CLIENT / NICK   │
             │   JOIN / PART / MESSAGE   │
             │   QUIT / PING / PONG      │
             │                            │
             └────────────────────────────┘

```