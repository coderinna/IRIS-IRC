
# IRISH S2S Architecture

The IRISH server-to-server connection layer is itself divided into smaller responsibilities.

A connection is not intended to become a single large class containing all networking and protocol logic.

The current architecture separates connection concerns into dedicated modules.

```text
                         IRISH S2S CONNECTION
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   S2SConnection     │
                       │   orchestration     │
                       └──────────┬──────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       INBOUND PIPELINE       PROTOCOL            OUTBOUND
             │                HANDLERS              │
             │                    │                 │
             ▼                    ▼                 ▼
      ┌──────────────┐      ┌───────────┐    ┌──────────────┐
      │ Validation   │      │ CLIENT    │    │ Messages     │
      │              │      │ NICK      │    │ HELLO        │
      │ Sequence     │      │ JOIN      │    │ AUTH         │
      │ Message ID   │      │ PART      │    │ SERVER       │
      │ Rate Limit   │      │ QUIT      │    │ READY        │
      └──────┬───────┘      │ MESSAGE   │    │ ACK          │
             │              │ PING/PONG │    └──────┬───────┘
             ▼              │ ...       │           │
      ┌──────────────┐      └───────────┘           │
      │ Deduplication│                              │
      └──────┬───────┘                              │
             ▼                                      │
      ┌──────────────┐                              │
      │ State        │                              │
      │ Validation   │                              │
      └──────┬───────┘                              │
             │                                      │
             └──────────────────┬───────────────────┘
                                │
                     ┌──────────▼──────────┐
                     │   ACK Management    │
                     │                     │
                     │ pending ACKs        │
                     │ ACK timeouts        │
                     │ tracked messages    │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │     Heartbeat       │
                     │                     │
                     │ PING / PONG         │
                     │ heartbeat timeout   │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │      Transport      │
                     │                     │
                     │ parser              │
                     │ send queue          │
                     │ backpressure        │
                     │ socket lifecycle    │
                     └──────────┬──────────┘
                                │
                                ▼
                           TCP SOCKET
```

The goal is to keep protocol responsibilities separated while allowing `S2SConnection` to act as the orchestration point.

---

## 🇫🇮 Suomeksi

IRISH-palvelinten välinen yhteyskerros on itse jaettu pienempiin vastuukokonaisuuksiin.

Yhden yhteysluokan ei ole tarkoitus sisältää kaikkea verkkoliikennettä, protokollalogiikkaa ja turvallisuuslogiikkaa.

Nykyinen rakenne jakaa vastuut omiin moduuleihinsa.

```text
IRISH S2S Connection
        │
        ├── Inbound validation
        │     ├── sequence
        │     ├── message ID
        │     └── rate limit
        │
        ├── Deduplication
        │
        ├── State validation
        │
        ├── Protocol handlers
        │
        ├── Outbound messages
        │     ├── HELLO
        │     ├── AUTH
        │     ├── SERVER
        │     ├── READY
        │     └── ACK
        │
        ├── ACK management
        │
        ├── Heartbeat
        │
        └── Transport
              ├── parser
              ├── send queue
              ├── backpressure
              └── socket lifecycle
```

Tavoitteena on pitää protokollan eri vastuut erillään ja käyttää `S2SConnection`-luokkaa niiden orkestrointipisteenä.

---

# IRISH S2S Layer

The IRISH S2S layer connects independent IRIS servers.

Its responsibilities include:

* server-to-server connections
* handshake
* authentication
* server identification
* capability negotiation
* protocol state management
* client synchronization
* channel synchronization
* message propagation
* routing
* connection health
* protocol extensions

The S2S layer consumes server events and translates them into IRISH protocol messages.

Incoming IRISH messages are validated before reaching protocol handlers.

```text
Core Event
    │
    ▼
Event Bus
    │
    ▼
IRISH S2S
    │
    ▼
Outbound Message
    │
    ▼
Transport
    │
    ▼
Remote IRIS Server
```

And in the opposite direction:

```text
Remote IRIS Server
    │
    ▼
Transport
    │
    ▼
Frame Parser
    │
    ▼
Validation
    │
    ▼
Deduplication
    │
    ▼
State Validation
    │
    ▼
Handler
    │
    ▼
Core / Event Bus
```

---

## 🇫🇮 Suomeksi

IRISH S2S -kerros yhdistää itsenäiset IRIS-palvelimet.

Sen vastuisiin kuuluvat esimerkiksi:

* palvelinten väliset yhteydet
* handshake
* autentikointi
* palvelinten identifiointi
* capability-neuvottelu
* protokollatilat
* käyttäjien synkronointi
* kanavien synkronointi
* viestien välitys
* routing
* yhteyden toimintakyvyn valvonta
* protokollalaajennukset

S2S-kerros kuluttaa palvelimen tapahtumia ja muuttaa niitä IRISH-protokollan viesteiksi.

Saapuvat IRISH-viestit validoidaan ennen niiden päätymistä protokollakäsittelijöille.

---