

# IRIS IRC Protocol

IRIS IRC introduces the **IRIS IRC Protocol**.

IRIS is the native server-to-server protocol designed for IRIS IRC.

It provides a structured foundation for communication between independent IRIS servers while allowing the protocol to evolve independently from the traditional IRC client protocol.

IRIS is designed around structured binary frames and explicit protocol state.

Current protocol concepts include:

* binary framing
* typed messages
* TLV-based fields
* message identifiers
* sequence numbers
* acknowledgements
* handshake states
* server authentication
* server identification
* capability negotiation
* connection lifecycle management
* heartbeat handling
* duplicate protection
* rate limiting
* state validation
* protocol handlers
* transport abstraction

The protocol is **intentionally** separated from the client-facing IRC protocol.

```text
IRC CLIENT PROTOCOL
        │
        │ client ↔ server
        ▼
   IRIS IRC SERVER
        │
        │ server ↔ server
        ▼
   IRIS PROTOCOL
```

---

## 🇫🇮 Suomeksi

IRIS IRC tuo mukanaan **IRIS IRC Protocolin**.

IRIS on IRIS IRC:tä varten suunniteltu palvelinten välinen protokolla.

Sen tarkoituksena on tarjota selkeä perusta itsenäisten IRIS-palvelinten väliselle kommunikaatiolle ja samalla mahdollistaa protokollan kehittäminen riippumatta perinteisen IRC-client-protokollan rajoituksista.

IRIS rakentuu rakenteisten binäärikehysten ja eksplisiittisten protokollatilojen ympärille.

Nykyisiä protokollan konsepteja ovat muun muassa:

* binäärinen framing
* tyypitetyt viestit
* TLV-pohjaiset kentät
* message ID:t
* sequence numerot
* ACK-kuittaukset
* handshake-tilat
* palvelinten autentikointi
* palvelinten identifiointi
* capability-neuvottelu
* yhteyden elinkaaren hallinta
* heartbeat
* duplicate protection
* rate limiting
* state validation
* protokollakäsittelijät
* transport-abstraktio

Protokolla on **tarkoituksella** erotettu käyttäjien käyttämästä IRC-protokollasta.
