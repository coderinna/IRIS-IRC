

# IRIS IRC Protokolla

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
