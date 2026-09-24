
# Jäljellä oleva ydintyö 🌸 IRIS IRCd

## IRC Server Foundation ✅

Ensimmäisessä vaiheessa rakennettiin IRIS IRCd perusta.

Toteutettu:
* IRC TCP-yhteydet
* Client-yhteyksien hallinta
* IRC-komentojen parserointi
* Client-rekisteröinti
* NICK / USER
*  Perusnumerics
*  IRC Client -olio
* IRC Channel -olio

**Tulos:** IRIS pystyi toimimaan itsenäisenä IRC-palvelimena.

## IRC Core & Channel System ✅

Seuraavaksi rakennettiin varsinaisen IRC-palvelimen toimintalogiikka.

Toteutettu:
* Clientien hallinta
* Kanavien hallinta
* JOIN / PART
* NICK / QUIT
* PRIVMSG / NOTICE
* Channel membership
* Clientien cleanup
* Event Bus IRC-tapahtumille

**Tulos:** yhdellä IRIS-palvelimella toimiva IRC oli käyttökelpoinen kokonaisuus.

## IRIS Protocol Foundation ✅

Rakennettiin IRISin oma server-to-server-protokollan perusta.

Toteutettu:
- IRIS Frame Protocol
- Frame header
- Message types
- TLV-rakenne
- Payload encode/decode
- Message IDs
- Sequence numbers
- Protocol constants

**Tulos:** IRISillä oli oma määritelty protokollakerros palvelinten välistä kommunikaatiota varten.

## S2S Lifecycle & Handshake ✅

Rakennettiin S2S-yhteyksien elinkaari ja palvelinten välinen kättely.

Toteutettu:
- S2S TCP-yhteydet
- Connection lifecycle
- Connection states
- HELLO
- AUTH
- SERVER identity
- READY
- Heartbeat / PING / PONG
- S2S connection manager

**Tulos:** IRIS-palvelimet pystyivät muodostamaan ja ylläpitämään hallittuja S2S-yhteyksiä.

## S2S Security Hardening 🔐 ✅

Tässä tehtiin se iso security/hardening-vaihe.

Toteutettu:
- Authentication validation
- Credential / identity binding
- Constant-time token comparison
- Frame validation
- Incoming / outgoing validation
- State validation
- Sequence protection
- ACK validation
- Deduplication
- Connection cleanup
- Invalid protocol state handling

**Tulos:** S2S-kerrokselle rakennettiin turvallinen ja
tilakoneeseen perustuva perusta ennen varsinaisen
verkko- ja viestireitityksen rakentamista.

## Network State & Server Topology ✅

S2S-yhteyksien päälle rakennettiin verkon tilanhallinta.

Toteutettu:
* Serverien identiteetit
* Remote server state
* Client state
* Server topology
* Parent / next-hop -reititys
* Remote client registry
* Useamman palvelimen ketjutus

Esimerkiksi:

iris-03
   │
   ↓
iris-02
   │
   ↓
iris-01

**Tulos:** IRIS ymmärtää, missä serverissä verkon clientit ja muut serverit sijaitsevat.

## Client Propagation ✅

Seuraavaksi clientien tila alettiin välittää S2S-verkon yli.

Toteutettu:
* CLIENT propagation
* NICK propagation
* JOIN propagation
* PART propagation
* QUIT propagation
* Remote client identity
* Client state usean serverin ketjussa

**Tulos:** eri IRIS-palvelimet tuntevat koko verkon clientit.

## Message Routing ✅

Viimeisessä valmistuneessa vaiheessa rakennettiin varsinainen IRC-viestien reititys verkon läpi.

Toteutettu:
* Local → Local
* Local → Remote
* Remote → Local
* Remote → Remote
* /msg
* Channel PRIVMSG
* Next-hop routing
* Route loop -esto
* Remote/local client -erottelu
* Channel message routing

**Tulos:** eri IRIS-palvelimille liittyneet IRC-clientit voivat kommunikoida keskenään normaalin IRC tapaan.

## Cross-Server IRC Functionality

**Tulos:** IRIS toimii käyttäjän näkökulmasta yhtenä multi-server IRC-verkkona.

Jaettu ala-osioihin:

###  IRC CORE ✅

IRC Core = yhden IRIS-palvelimen normaali IRC-toiminta.

Toteutettu:
*  Client-yhteydet ja rekisteröinti
*  NICK / USER / QUIT
*  JOIN / PART
*  Kanavat ja jäsenyydet
*  PRIVMSG ja NOTICE
*  Clientien ja kanavien hallinta
*  Event Bus IRC-tapahtumille

###  S2S TRANSPORT ✅

S2S Transport = miten IRIS-palvelimet kommunikoivat keskenään.

Toteutettu:
*  TCP-pohjaiset S2S-yhteydet
* IRIS frame -protokolla
* HELLO / AUTH / SERVER / READY -kättely
* Sequence-numerot
* ACK
* Heartbeat / PING / PONG
* Framejen encode/decode
* S2S-yhteyksien hallinta

###  CLIENT PROPAGATION ✅

Client Propagation = miten yhden palvelimen clientit tunnetaan koko IRIS-verkossa.

Toteutettu:
* Clientin esittely muille palvelimille
* Clientin NICK-muutokset
* JOIN
* PART
* QUIT
* Client-identiteetin ja serverin välisen suhteen ylläpito
* Client-tilan välitys useamman palvelimen ketjussa

###  MESSAGE ROUTING ✅ 

Message Routing = miten viesti löytää oikean clientin tai kanavan koko IRIS-verkon läpi.
Message Routing päättää, minne IRC-viesti toimitetaan IRIS-verkossa.

Toteutettu:
* Local client → local client
* Remote client → local client
* Local client → remote client
* Remote client → remote client
* Yksityisviestit /msg
* Channel PRIVMSG
* Next-hop-reititys
* Viestin palautumisen estäminen samaan yhteyteen
* Remote clientien ja local clientien oikea erottelu
* Channel-viestien toimitus usean S2S-palvelimen yli

## Channel State Sync 🔄

████████░░░░░░░░░░░░  seuraava

Channel State Sync = miten IRC-kanavien tila pidetään yhdenmukaisena koko IRIS-verkon välillä.

### CHANNEL STATE

Channel State = kanavan perustila ja sen hallinta.

Tavoitteena:
- Channel name       ✅
- Channel members    ✅ nykyinen
Channel servers 🟡 — rakenne on olemassa, mutta servers-setin täyttyminen / ylläpito pitää vielä korjata
Channel ownership 🟡 — rakenne on olemassa, mutta ownerin muodostuminen pitää vielä varmistaa
Channel lifecycle 🟡 — active / empty / removed on olemassa, mutta verkon yli tapahtuva lifecycle pitää vielä testata
Synchronization ✅ initial CHANNEL_STATE sync toimii
Reconnect sync ✅
CLIENT state sync ✅


### CHANNEL MEMBERSHIP

Channel Membership = miten käyttäjien jäsenyydet välitetään palvelimien välillä.

Tavoitteena:
- JOIN state ✅
- PART state ✅
- Remote membership 🟡 initial sync toimii, jatkuva tila vielä testattava
- Membership propagation ✅
- Member removal 🟡 testattava reconnectin jälkeen
- Tyhjän channelin cleanup 🟡 olemassa, testattava verkon yli

Channel synchronization on jo valmis tältä osin.


### CHANNEL LIFECYCLE

Channel Lifecycle = miten kanava syntyy, muuttuu ja poistuu verkossa.

Tavoitteena:
- Channel create🟡 — kanava syntyy kyllä paikallisesti ja NetworkManageriin, mutta verkon yli tapahtuva luonti kannattaa vielä varmistaa/testata.
- Channel discovery🟡 — remote channel löytyy NetworkManagerista, mutta tämä kannattaa vielä testata reconnect/snapshot-tilanteessa.
- Channel synchronization ✅ nyt toimii initial snapshotilla
- Channel remove🟡 — rakenne on olemassa, mutta verkon yli tapahtuva poistuminen pitää vielä testata.
- Empty channel cleanup🟡 — cleanup-logiikka on olemassa, mutta pitää varmistaa erityisesti tilanteessa, jossa viimeinen käyttäjä poistuu toiselta palvelimelta.

### CHANNEL MODES

MODE kertoo, millaiset asetukset kanavalla on.
+m       moderated
+n       ulkopuoliset eivät voi lähettää kanavalle
+t       topicin vaihtaminen rajoitettu
+i       invite-only
+k       kanavalla on salasana
+l       käyttäjämäärälle limit

Tavoitteena:
- MODE propagation 🔴
- Channel mode state 🔴
- Mode changes 🔴
- Remote mode synchronization 🔴

### CHANNEL TOPIC 🔴

TOPIC on kanavan näkyvä aihe/kuvaus.

Tavoitteena:
- Topic state  🔴
- TOPIC propagation 🔴
- Topic changes 🔴
- Remote topic synchronization 🔴

Rakenne on jo olemassa:

topic

ja CHANNEL_STATE pystyy jo kuljettamaan topicin, mutta TOPIC propagation/synkronointi ei ole vielä valmis.

### CHANNEL ROUTING STATE

IRIS tietää, missä palvelimissa tiettyä kanavaa ja sen jäseniä on, jotta viesti voidaan lähettää oikeaan suuntaan.

Channel Routing State = tieto siitä, mille palvelimille kanavan liikennettä pitää reitittää.

Channel state       ✅
Remote membership   ✅
Server information  🟡
Message routing     ✅
S2S MESSAGE         ✅

## S2S HARDENING

████████████░░░░░░░░

- validointi
- dedup
- ACK:t
- sequence handling
- state validation
- edge cases


## CLIENT POLISH

████████████░░░░░░░░
   ├── NICK
   ├── QUIT
   ├── JOIN presentation
   ├── HELP
   └── muut IRC-clientin viimeistelyt
- testaus
- mahdolliset IRC-yhteensopivuusjutut
- viimeiset käyttökokemuksen ongelmat

## Oman IRIS-serverin pystystys

                 IRIS Network
                     🌸
                      │
        ┌─────────────┼─────────────┐
        │             │             │
     iris-01       iris-02       iris-03
        │             │             │
      users         users         users
                                     
                      ↑
                uusi IRIS server
                   iris-04
                      │
                  uusi käyttäjä

Hänen pitäisi käytännössä pystyä:
npm install iris-ircd

konfiguroida esimerkiksi:
serverId: iris-04
serverName: my.iris.server
parent: iris-03

ja käynnistää:
npm start

Sen jälkeen:
iris-04
   │
   │ S2S
   ↓
iris-03
   │
   ├── iris-02
   │
   └── iris-01

Ja iris-04:n käyttäjät näkyvät koko IRIS-verkossa, aivan kuten nykyiset clientit.
Tämä vaatii vielä käytännössä
Channel Syncin lisäksi erityisesti:
- Server onboarding / join procedure
- S2S authentication credentials
- Server configuration
- Server identity
- Network discovery / topology
- Reitityksen automaattinen toiminta
- Konfliktien käsittely
- Dokumentoidut asennusohjeet
- Package/install workflow

**Nykyinen arkkitehtuuri on jo rakennettu tätä ajatusta varten**. serverId, serverName, topology, parent/next-hop, remote state ja S2S lifecycle eivät ole vain kolmen kiinteän serverin varten.


Future: Anyone can run an IRIS server and join the IRIS Network. 🌸


Kyllä — jos päätätte, että IRIS Network on teidän ylläpitämä verkko, silloin malli voisi olla juuri tämä:
                    🌸 IRIS NETWORK
                    ───────────────
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       iris-01        iris-02        iris-03
       official       official       official
          │              │              │
          └──────────────┼──────────────┘
                         │
                  external servers
                         │
                      iris-04
                    community
                      server

Meidän ylläpitämä
- IRIS Networkin viralliset serverit
- network topologyä
- serverien välistä luottamusta
- S2S authenticationia
- network policyä
- protokollaversiota
- verkon palvelimia ja infrastruktuuria
- dokumentaatiota

Muut voivat liittyä
Myöhemmin voisi olla mahdollista, että joku asentaa oman IRIS-palvelimen:
my-irc.example
       │
       │ S2S
       ↓
  IRIS Network

ja liittyy verkkoon sovittujen ehtojen mukaisesti.
Tämä tekee eron IRIS IRCd:n ja IRIS Networkin välillä:
IRIS IRCd = ohjelmisto, jolla serveriä ajetaan.
IRIS Network = verkko, jota serverit muodostavat ja jota te ylläpidätte.

Lopullinen konsepti:
IRIS IRCd → avoin serveriohjelmisto
IRIS Protocol → serverien yhteinen protokolla
IRIS Network → varsinainen verkko 🌸
Silloin joku voi teoriassa ajaa omaa IRIS-serveriään itsenäisesti, mutta IRIS Networkiin liittyminen on erikseen hallittu asia.


## Future: IRISin security layer

- Miten serverit todentavat toisensa
- miten avainten vaihto tehdään
- miten replay-hyökkäykset estetään
- miten viestien eheys varmistetaan 
- ja miten compromised server käyttäytyy.

