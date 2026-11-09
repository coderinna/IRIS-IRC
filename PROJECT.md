
# Jäljellä oleva ydintyö 🌸 IRIS IRCd

## IRC Server Foundation ✅

Ensimmäisessä vaiheessa rakennettiin IRIS IRCd perusta.

**Toteutettu:**
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

**Toteutettu:**
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

**Toteutettu:**
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

**Toteutettu:**
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

**Toteutettu:**
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

**Toteutettu:**
* Serverien identiteetit
* Remote server state
* Client state
* Server topology
* Parent / next-hop -reititys
* Remote client registry
* Useamman palvelimen ketjutus

Esimerkiksi:

```text
iris-03
   │
   ↓
iris-02
   │
   ↓
iris-01
```

**Tulos:** IRIS ymmärtää, missä serverissä verkon clientit ja muut serverit sijaitsevat.

## Client Propagation ✅

Seuraavaksi clientien tila alettiin välittää S2S-verkon yli.

**Toteutettu:**
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

**Toteutettu:**
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

IRIS toimii käyttäjän näkökulmasta yhtenä multi-server IRC-verkkona.

Jaettu ala-osioihin:

###  IRC CORE ✅

IRC Core = yhden IRIS-palvelimen normaali IRC-toiminta.

**Toteutettu:**
*  Client-yhteydet ja rekisteröinti
*  NICK / USER / QUIT
*  JOIN / PART
*  Kanavat ja jäsenyydet
*  PRIVMSG ja NOTICE
*  Clientien ja kanavien hallinta
*  Event Bus IRC-tapahtumille

**Tulos:** 
* IRIS-palvelimella on toimiva IRC-ydin, joka mahdollistaa käyttäjien yhdistämisen palvelimelle, rekisteröitymisen, kanavien luomisen ja niille liittymisen sekä reaaliaikaisen viestinnän.
* IRC Core muodostaa perustan S2S-protokollalle ja hajautetulle IRIS-verkostolle.
* Käyttäjät voivat käyttää IRISiä tavallisilla IRC-asiakasohjelmilla.

###  S2S TRANSPORT ✅

S2S Transport = miten IRIS-palvelimet kommunikoivat keskenään.

**Toteutettu:**
*  TCP-pohjaiset S2S-yhteydet
* IRIS frame -protokolla
* HELLO / AUTH / SERVER / READY -kättely
* Sequence-numerot
* ACK
* Heartbeat / PING / PONG
* Framejen encode/decode
* S2S-yhteyksien hallinta

**Tulos:**
IRIS-palvelimet pystyvät muodostamaan keskenään tunnistetun ja hallitun TCP-yhteyden sekä välittämään protokollaviestit luotettavasti IRISin oman frame-rakenteen avulla.

###  CLIENT PROPAGATION ✅

Client Propagation = miten yhden palvelimen clientit tunnetaan koko IRIS-verkossa.

**Toteutettu:**
* Clientin esittely muille palvelimille
* Clientin NICK-muutokset
* JOIN
* PART
* QUIT
* Client-identiteetin ja serverin välisen suhteen ylläpito
* Client-tilan välitys useamman palvelimen ketjussa

**Tulos:**
IRIS ylläpitää yhtenäistä client-tilaa koko palvelinverkossa.
Käyttäjät ja heidän tilamuutoksensa välittyvät palvelimelta toiselle myös useamman palvelimen ketjuissa.

###  MESSAGE ROUTING ✅ 

Message Routing = miten viesti löytää oikean clientin tai kanavan koko IRIS-verkon läpi.
Message Routing päättää, minne IRC-viesti toimitetaan IRIS-verkossa.

**Toteutettu:**
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

**Tulos:**
* IRIS reitittää yksityisviestit ja kanavaviestit oikeille vastaanottajille koko hajautetussa palvelinverkossa.
* Viestit kulkevat paikallisten ja etäpalvelimien välillä next-hop-reitityksellä, ja viestin palautuminen samaan yhteyteen estetään.
* Näin käyttäjät voivat viestiä keskenään riippumatta siitä, mihin IRIS-palvelimeen he ovat yhteydessä.

## Channel State Sync 

Channel State Sync = miten IRC-kanavien tila pidetään yhdenmukaisena koko IRIS-verkon välillä.

### CHANNEL STATE 🟡

Channel State = kanavan perustila ja sen hallinta.

**Toteutettu:**
* Channel name ✅
* Channel members ✅ – jäsenet välittyvät palvelimien välillä ja /NAMES näyttää remote-jäsenet.
* Initial CHANNEL_STATE sync ✅ – kanavan alkutilan synkronointi toimii.
* Reconnect sync ✅ – kanavan tila palautuu yhteyden muodostuessa uudelleen.
* CLIENT state sync ✅ – clientien tilatiedot synkronoituvat.

**Tavoitteena (vaatii vielä lisätestausta):**
* Channel servers 🟡 – servers-rakenne ja CHANNEL_STATE-kuljetus toimivat, mutta palvelinjoukon päivittyminen jäsenmuutosten  yhteydessä vaatii testausta.
* Channel ownership 🟡 – ownerServerId välittyy CHANNEL_STATE:ssa, mutta omistajan muodostumista ja muuttumista ei ole testattu erikseen.
* Channel lifecycle 🟡 – active/empty/removed-tilat ja niiden hallinta on toteutettu, mutta verkon yli tapahtuva koko elinkaari vaatii testausta.

**Tulos:**
* IRIS ylläpitää kanavien perustilaa ja välittää kanavien jäsenyydet sekä muun tilatiedon palvelimien välillä.
* Initial CHANNEL_STATE -synkronointi ja reconnect-synkronointi palauttavat kanavien ja clientien tilan palvelinyhteyden muodostuessa uudelleen.
* Kanavien palvelinrakenteen, omistajuuden ja elinkaaren toiminta on toteutettu, mutta niiden kaikkia verkon yli tapahtuvia muutostilanteita ei ole vielä testattu kattavasti.

### CHANNEL MEMBERSHIP

Channel Membership = miten käyttäjien jäsenyydet välitetään palvelimien välillä.

Tavoitteena:
- JOIN state ✅
- PART state ✅
- Remote membership ✅
- Membership propagation ✅
- Member removal 🟡 PART toimii ja poistuminen propagoi, mutta reconnectin jälkeen tapahtuva member removal ei ole vielä erikseen testattu.
- Tyhjän channelin cleanup 🟡 remove-client.js / channelin cleanup-rakenne on olemassa, 
mutta tilannetta, jossa viimeinen remote-käyttäjä poistuu ja kanava tyhjenee verkon yli, ei ole vielä testattu.

### CHANNEL LIFECYCLE 🟡

Channel Lifecycle = miten kanava syntyy, muuttuu ja poistuu verkossa.

**Toteutettu ja toimivaksi varmistettu:**
- Channel create – paikallinen kanavan luonti toimii ja remote-kanavan luonti CHANNEL_STATE-vastaanotossa on toteutettu. ✅
- Channel discovery – reconnect recovery palautti #test-kanavan iris-02-palvelimen NetworkManageriin. ✅
- Channel synchronization – initial CHANNEL_STATE -synkronointi ja reconnect sync toimivat. ✅

**Toteutettu, mutta vaatii vielä testausta:**
- Channel remove 🟡 – removeChannel() on toteutettu, mutta verkon yli tapahtuvaa kanavan poistamista ei ole testattu.
- Empty channel cleanup 🟡 – paikallinen cleanup-rakenne on olemassa, mutta viimeisen remote-jäsenen poistumista ja sitä seuraavaa kanavan poistumista ei ole testattu.

**Tekemättä / varmistamatta:**
- Kanavan ensimmäisen luonnin päästä päähän -testi kahden palvelimen välillä.
- Kanavan poistumisen testaus koko verkossa.
- Viimeisen jäsenen poistumisen jälkeisen tyhjennys- ja poistumisprosessin testaus usean palvelimen verkossa.

**Tulos:**
* IRIS osaa luoda ja synkronoida kanavia palvelimien välillä sekä palauttaa kanavat reconnect-tilanteissa.
* Kanavien löytämisen ja synkronoinnin perustoiminta on varmistettu.
* Vielä testaamatta ovat erityisesti kanavan poistuminen ja tyhjentyneen kanavan siivoaminen koko verkosta.

### CHANNEL MODES 🟡

**Toteutettu:**
- MODE S2S -viestirakenne toteutettu ✅
- MODE encode/decode TLV-muodossa ✅
- MODE-viestityyppi rekisteröity protokollaan ✅
- MODE-vastaanottokäsittelijä toteutettu ✅
- MODE-tapahtuman lähetys S2S-managerista toteutettu ✅
- MODE-propagointi muille palvelimille toteutettu kooditasolla ✅
- Message ID:n säilyttäminen edelleen välitettäessä ✅
- Remote-clientin identiteetin ja kanavajäsenyyden tarkistukset ✅
- Operaattorioikeuden tarkistus vastaanotossa ✅
- +i-muutosten käsittely MODE-vastaanotossa ✅
- +o-muutosten käsittely MODE-vastaanotossa ✅
- Paikallisten käyttäjien ilmoittaminen remote MODE-muutoksista ✅

**Tekemättä:**
- +v voice-oikeuden käsittelyä S2S MODE -vastaanotossa on valmisteltu. 🟡
- +m-moodin toiminnallisuus 🟡 	Tekemättä / varmistamatta
- +n-moodin toiminnallisuus 🟡 v	Perusjäsenyystarkistus jo olemassa, täydellinen testaus kesken
- +t-moodin täydellinen testaus 🟡
- +k-kanavasalasana 🟡 	Toteutus olemassa, testaus kesken
- +l-käyttäjärajoitus 🟡 	Toteutus olemassa, testaus kesken
- Kaikkien moodien CHANNEL_STATE-synkronointi 🟡
- MODE-muutosten reconnect-synkronointi 🟡
- Kahden ja useamman palvelimen MODE-testit 🟡
- MODE-oikeuksien reunatapaukset 🟡
- Virheellisten moodikirjainten ja parametrien käsittely 🟡
CHANNEL_STATE-moodien synkronointi	Osittain toteutettu
MODE reconnect-synkronointi	Osittain työn alla
2+ palvelimen MODE-testit	Tekemättä / vahvistamatta

MODE-oikeuksien reunatapaukset
- Operaattori poistaa omat oikeutensa.
- Operaattori yrittää antaa oikeudet kanavan ulkopuoliselle.
- Tavallinen käyttäjä yrittää muuttaa moodia.
- Tuntematon moodikirjain.
- Virheelliset MODE-parametrit.
- Remote-operaattorin oikeuksien tarkistus.

### CHANNEL TOPIC VALMIS ✅ 

- Remote topic synchronization 🟡 testaamatta kahden palvelimen välisen topic-muutoksen ja reconnectin jälkeisen synkronoinnin käytännössä.

**Toteutettu:**
- TOPIC-viestin oma S2S-tyyppi (0x19).
- TOPIC-viestin encode/decode TLV-rakenteella.
- TOPICin lähetys palvelimelta toiselle.
- Vastaanottavan palvelimen topic-tilan päivitys.
- TOPICin edelleen välitys muihin palvelimiin.
- Paikallisten käyttäjien ilmoittaminen muutoksesta.
- +t-oikeuksien tarkistus.
- Tyhjän topicin käsittely eli topicin poistaminen.
- ACK-seuranta.

**Tulos:**  TOPIC on kanavan näkyvä aihe/kuvaus. Topic state, propagation ja changes.

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

- validointi message ✅
- validointi message 🟡
- dedup ✅
- ACK:t ✅
- sequence handling 🟡
- state validation ✅
- edge cases 🟡


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