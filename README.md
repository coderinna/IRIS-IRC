
# IRIS-IRCd 

IRIS Internet Reley Chat Daemon
<p align="center">

  <img src="./images/IRIS-irc-logo.png" width="300">

</p>

<p align="center">
  <code>IRC Client →  IRIS IRCd + IRIS S2S Disturbed NETWORK PROTOCOL </code>
</p>

---

IRIS on alusta asti itse kehitetty Node.js-pohjainen IRC-palvelinohjelmisto, jonka tavoitteena on yhdistää perinteisen IRC:n kevyt ja laajasti tuettu asiakasrajapinta modernimpaan hajautettuun palvelinarkkitehtuuriin.

IRC-protokolla toimii IRISissä asiakasrajapintana ja yhteensopivuuskerroksena. Sen ansiosta olemassa olevat IRC-asiakasohjelmat, kuten irssi, WeeChat ja HexChat, voivat muodostaa yhteyden IRIS-palvelimeen ilman erillistä IRIS-kohtaista client-ohjelmistoa.

Palvelinten välinen liikenne ei kuitenkaan perustu perinteiseen IRC-palvelinten väliseen protokollaan. IRIS käyttää tähän tarkoitukseen projektia varten suunniteltua omaa IRIS-S2S-protokollaa, joka muodostaa palvelinten välisen hajautetun viestintäkerroksen.

Tämän rakenteen ansiosta IRIS erottaa toisistaan kaksi eri käyttötarkoitusta:

* IRC toimii ulospäin tuttuna ja kevyenä asiakasrajapintana.
* IRIS-S2S vastaa palvelinten välisestä hajautetusta tiedonsiirrosta ja verkon toiminnasta.

Näin IRIS voi säilyttää IRC:n pitkään kehittyneen client-ekosysteemin ja keveyden, samalla kun palvelinten välinen verkkokerros voidaan suunnitella IRIS:n omien hajautetun verkon tarpeiden mukaisesti ja voidaan räätälöidä mieleiseksi.

## Arkkitehtuuri


```text
                                      IRC CLIENTS
                         ┌─────────────────────────────────┐
                         │                                 │
                         │  HexChat   irssi   WeeChat      │
                         │  Web IRC   Bots   Services      │
                         │                                 │
                         └───────────────┬─────────────────┘
                            │
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          Direct TCP     TLS / SSL    SSH Tunnel
              │             │             │
              │             │        SSH → TCP
              │             │        forwarding
              └─────────────┼─────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              IRIS IRCd                                       │
│                                                                              │
│                         Classic IRC Protocol                                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         NETWORK LAYER                                  │  │
│  │                                                                        │  │
│  │  TCP Listener → Connections → Sessions → Connection Lifecycle          │  │
│  └────────────────────────────────┬───────────────────────────────────────┘  │
│                                   │                                          │
│                                   ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         IRC PROTOCOL                                   │  │
│  │                                                                        │  │
│  │ Parser → Validation → Command Router → Command Handler → Serializer   │  │
│  │                                                                        │  │
│  │ NICK USER JOIN PART PRIVMSG NOTICE MODE QUIT ...                      │  │
│  └────────────────────────────────┬───────────────────────────────────────┘  │
│                                   │                                          │
│                                   ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                              CORE                                      │  │
│  │                                                                        │  │
│  │ Users · Nicknames · Channels · Permissions                            │  │
│  │ Sessions · Membership · Modes · Server State                          │  │
│  │                                                                        │  │
│  │                    CORE OWNS SERVER STATE                              │  │
│  └────────────────────────────────┬───────────────────────────────────────┘  │
│                                   │                                          │
│                              Domain Events                                   │
│                                   ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                           EVENT BUS                                    │  │
│  │                                                                        │  │
│  │ connection · user.created · nick.changed · channel.joined              │  │
│  │ message.sent · user.quit · channel.changed · server.connected           │  │
│  └──────────────┬─────────────────┬─────────────────┬─────────────────────┘  │
│                 │                 │                 │                        │
│                 ▼                 ▼                 ▼                        │
│          ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐    │
│          │   SERVICES   │  │ OBSERVABILITY│  │       IRIS S2S            │    │
│          │              │  │              │  │                          │    │
│          │ NickServ     │  │ Logging      │  │ Link Manager             │    │
│          │ ChanServ     │  │ Metrics      │  │ S2S Connections           │    │
│          │ Oper/Admin   │  │ Telemetry    │  │ IRIS Protocol            │    │
│          │ Future       │  │ Health       │  │ Handshake                 │    │
│          └──────────────┘  └──────────────┘  │ Authentication             │    │
│                                              │ Capability negotiation     │    │
│                                              │ Sync / Routing             │    │
│                                              └──────────────┬────────────┘    │
└─────────────────────────────────────────────────────────────┼────────────────┘
                                                              │
                                                              │ IRIS Protocol
                                                              ▼
                              ┌───────────────────────────────────────────────┐
                              │                 IRIS NETWORK                  │
                              │                                               │
                              │       ┌────────────┐      ┌────────────┐      │
                              │       │  IRIS IRC  │◄────►│  IRIS IRC  │      │
                              │       │  SERVER A  │ IRIS│  SERVER B  │      │
                              │       └──────┬─────┘      └──────┬─────┘      │
                              │              │                    │           │
                              │              │       IRIS        │           │
                              │              └──────────┬─────────┘           │
                              │                         ▼                     │
                              │                  ┌────────────┐               │
                              │                  │  IRIS IRC  │               │
                              │                  │  SERVER C  │               │
                              │                  └────────────┘               │
                              └───────────────────────────────────────────────┘

                     PERSISTENCE / INFRASTRUCTURE (Tulevaisuudessa)
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
      │ PostgreSQL  │      │    Redis    │      │  Metrics /  │
      │             │      │             │      │  Telemetry  │
      │ Persistent  │      │ Cache /     │      │             │
      │ State       │      │ Temporary   │      │ Health /    │
      │             │      │ State       │      │ Performance │
      └─────────────┘      └─────────────┘      └─────────────┘

```

## LISENSSI

- [LICENSE](./LICENSE)