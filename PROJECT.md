
# Jäljellä oleva ydintyö 🌸 IRIS IRCd

<!-- TOC START -->

- [1. IRC Server Foundation ✅](#irc-server-foundation)
- [2. IRC Core & Channel System ✅](#irc-core-channel-system)
- [3. IRIS Protocol Foundation ✅](#iris-protocol-foundation)
- [4. S2S Lifecycle & Handshake ✅](#s2s-lifecycle-handshake)
- [5. S2S Security Hardening ✅](#s2s-security-hardening)
- [6. Network State & Server Topology ✅](#network-state-server-topology)
- [7. Client Propagation ✅](#client-propagation)
- [8. Message Routing ✅](#message-routing)
- [9. Cross-Server IRC Functionality  ✅](#cross-server-irc-functionality)
  - [9.1. IRC CORE ✅](#irc-core)
  - [9.2. S2S TRANSPORT ✅](#s2s-transport)
  - [9.3. CLIENT PROPAGATION ✅](#client-propagation-1)
  - [9.4. MESSAGE ROUTING ✅](#message-routing-1)
- [10. Channel State Sync 🟡](#channel-state-sync)
  - [10.1. CHANNEL STATE 🟡](#channel-state)
  - [10.2. CHANNEL MEMBERSHIP](#channel-membership)
  - [10.3. CHANNEL LIFECYCLE 🟡](#channel-lifecycle)
  - [10.4. CHANNEL MODES 🟡](#channel-modes)
  - [10.5. CHANNEL TOPIC VALMIS ✅](#channel-topic-valmis)
  - [10.6. CHANNEL ROUTING STATE](#channel-routing-state)
- [11. S2S Reliability & Edge Cases 🟡](#s2s-reliability-edge-cases)
- [12. IRC Client Compatibility & Polish 🟡](#irc-client-compatibility-polish)
- [13. Authentication & Authorization 🟡](#authentication-authorization)
  - [13.1. S2S-palvelinten välinen](#s2s-palvelinten-välinen)
  - [13.2. Vielä toteutettava ja varmistettava](#vielä-toteutettava-ja-varmistettava)
  - [13.3. IRC-Client Authentication = miten IRC-käyttäjä tunnistautuu IRC-palvelimelle](#irc-client-authentication-miten-irc-käyttäjä-tunnistautuu-irc-palvelimelle)
  - [13.4. IRC Operator Authentication = miten palvelimen ylläpitäjä tunnistautuu IRC-operaattoriksi](#irc-operator-authentication-miten-palvelimen-ylläpitäjä-tunnistautuu-irc-operaattoriksi)
  - [13.5. Authorization & Permission Management = Mitä tunnistetut käyttäjät ja palvelimet saavat tehdä IRIS-verkossa](#authorization-permission-management-mitä-tunnistetut-käyttäjät-ja-palvelimet-saavat-tehdä-iris-verkossa)
  - [13.6. Connection Security = IRC-clientien ja IRIS-palvelinten välisten yhteyksien suojaaminen](#connection-security-irc-clientien-ja-iris-palvelinten-välisten-yhteyksien-suojaaminen)

<!-- TOC END -->
## 1. IRC Server Foundation ✅

Ensimmäisessä vaiheessa rakennettiin IRIS IRCd perusta.

**Toteutettu:**
* IRC TCP-yhteydet
* Client-yhteyksien hallinta
* IRC-komentojen parserointi
* Client-rekisteröinti
* NICK / USER
* Perusnumerics
* IRC Client -olio
* IRC Channel -olio

**Tulos:** IRIS pystyi toimimaan itsenäisenä IRC-palvelimena.

## 2. IRC Core & Channel System ✅

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

## 3. IRIS Protocol Foundation ✅

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

## 4. S2S Lifecycle & Handshake ✅

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

## 5. S2S Security Hardening ✅

Tässä tehtiin se iso security/hardening-vaihe 🔐.

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

## 6. Network State & Server Topology ✅

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

## 7. Client Propagation ✅

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

## 8. Message Routing ✅

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

## 9. Cross-Server IRC Functionality  ✅

IRIS toimii käyttäjän näkökulmasta yhtenä multi-server IRC-verkkona.

Jaettu ala-osioihin:

### 9.1. IRC CORE ✅

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

### 9.2. S2S TRANSPORT ✅

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

### 9.3. CLIENT PROPAGATION ✅

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

### 9.4. MESSAGE ROUTING ✅

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

## 10. Channel State Sync 🟡

Channel State Sync = miten IRC-kanavien tila pidetään yhdenmukaisena koko IRIS-verkon välillä.

### 10.1. CHANNEL STATE 🟡

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

### 10.2. CHANNEL MEMBERSHIP

Channel Membership = miten käyttäjien jäsenyydet välitetään palvelimien välillä.

Tavoitteena:
- JOIN state ✅
- PART state ✅
- Remote membership ✅
- Membership propagation ✅
- Member removal 🟡 PART toimii ja poistuminen propagoi, mutta reconnectin jälkeen tapahtuva member removal ei ole vielä erikseen testattu.
- Tyhjän channelin cleanup 🟡 remove-client.js / channelin cleanup-rakenne on olemassa, 
mutta tilannetta, jossa viimeinen remote-käyttäjä poistuu ja kanava tyhjenee verkon yli, ei ole vielä testattu.

### 10.3. CHANNEL LIFECYCLE 🟡

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

### 10.4. CHANNEL MODES 🟡

**Toteutettu:**
*  MODE S2S -viestirakenne toteutettu 
* MODE encode/decode TLV-muodossa 
* MODE-viestityyppi rekisteröity protokollaan 
* MODE-vastaanottokäsittelijä toteutettu 
* MOD-tapahtuman lähetys S2S-managerista toteutettu 
* MODE-propagointi muille palvelimille toteutettu kooditasolla 
* Message ID:n säilyttäminen edelleen välitettäessä 
* Remote-clientin identiteetin ja kanavajäsenyyden tarkistukset 
* Paikallisten käyttäjien ilmoittaminen remote MODE-muutoksista 
* Operaattorioikeuden tarkistus vastaanotossa 
* +i-muutosten käsittely MODE-vastaanotossa 
* +o-muutosten käsittely MODE-vastaanotossa 
* +v-muutosten käsittely MODE-vastaanotossa 
* +m-moodin käsittely MODE-vastaanotossa 
* +n-moodin käsittely MODE-vastaanotossa 
* +t-moodin käsittely MODE-vastaanotossa 
* Paikallinen +m-viestirajoitus 
* S2S-reitityksen +m-viestirajoitus 
* Paikallinen +n-jäsenyystarkistus 
* S2S-reitityksen +n-jäsenyystarkistus 
* MODE-komennon moodikohtainen tiedostojako (i, k, l, m, n, o, t, v) 
* +t-topic-lukituksen täydellinen toiminnallinen varmistus 
* +k-knavasalasanan toiminnallinen varmistus 
* +l-käyttäjärajoituksen toiminnallinen varmistus 
* Kahden ja useamman palvelimen MODE-testit 

**Tekemättä:**
* m, n ja v: toiminnallinen testaus vielä tekemättä. 🟡
* Kaikkien moodien CHANNEL_STATE-synkronointi 🟡
* MODE-muutosten reconnect-synkronointi 🟡
* Useamman kuin 2 palvelimen MODE-testit 🟡
* MODE-testit ERI kanavilla ja usealla 🟡
* Virheellisten moodikirjainten ja parametrien käsittely 🟡

MODE-oikeuksien reunatapaukset
- Operaattori poistaa omat oikeutensa.
- Operaattori yrittää antaa oikeudet kanavan ulkopuoliselle.
- Tavallinen käyttäjä yrittää muuttaa moodia.
- Tuntematon moodikirjain.
- Virheelliset MODE-parametrit.
- Remote-operaattorin oikeuksien tarkistus.

### 10.5. CHANNEL TOPIC VALMIS ✅

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

### 10.6. CHANNEL ROUTING STATE

IRIS tietää, missä palvelimissa tiettyä kanavaa ja sen jäseniä on, jotta viesti voidaan lähettää oikeaan suuntaan.
Channel Routing State = tieto siitä, mille palvelimille kanavan liikennettä pitää reitittää.

**Toteutettu:**
* Channel state       ✅
* Remote membership   ✅
* Server information  🟡
* Message routing     ✅
* S2S MESSAGE         ✅

**Tulos:** 

## 11. S2S Reliability & Edge Cases 🟡

S2S Reliability = miten IRIS-palvelinten välinen verkko toimii virhe-, katkos- ja palautumistilanteissa.

**Toteutettu:**
- Message validation
- Frame validation
- Message deduplication
- ACK handling
- Connection state validation
- Connection cleanup
- Sequence number handling (perustoiminta)

**Varmistettava:**
- [ ] Sequence number -virhetilanteet
- [ ] Puuttuvien ACK-kuittausten käsittely
- [ ] Duplikaattiviestien estäminen
- [ ] Virheellisten tai puutteellisten viestien käsittely
- [ ] Odottamattomien viestien käsittely eri yhteystiloissa
- [ ] S2S-yhteyden katkeaminen kesken viestinvälityksen
- [ ] Reconnect ja verkon tilan palautuminen
- [ ] Vanhojen remote client -tietojen poistaminen
- [ ] Vanhentuneiden reittien poistaminen
- [ ] Samanaikaisten yhteyskatkojen käsittely
- [ ] Netsplit-tilanteiden käsittely
- [ ] Verkon palautuminen osittaisen yhteyskatkon jälkeen
- [ ] Viestien silmukkareitityksen estäminen
- [ ] Palvelinten ristiriitaisen tilan tunnistaminen ja ratkaiseminen

**Tulos:**

- IRIS pystyy käsittelemään S2S-yhteyksien virhetilanteita hallitusti.
- Yhteyskatkot eivät jätä verkkoon pysyvästi virheellistä client-, channel- tai routing-tilaa.
- Palvelimet pystyvät palauttamaan verkkotilansa yhteyden muodostuessa uudelleen.


## 13. Authentication & Authorization 🟡

### 13.1. S2S Security
moi
Rakennettu on paljon enemmän kuin pelkän IRC-palvelinten välisen kirjautumisen.
Nyt testataan, kestääkö IRIS myös oikean hajautetun IRC-verkon häiriöitä ja hyökkäystilanteita.

#### Toteutettu

1. Palvelinten tunnistaminen ja autentikointi

- [x] Palvelinten HELLO-tunnistus
- [x] AUTH-autentikointi
- [x] Molemminpuolinen palvelinautentikointi
- [x] TrustRegistry eli luottamusrekisteri
- [x] Tuntemattomien palvelinten tunnistaminen ja hylkääminen
- [x] Virheellisen autentikoinnin hylkääminen
- [x] Palvelimen CONNECT-oikeuden tarkistus
- [x] Palvelinidentiteetin validointi (serverId ja serverName)

2. Yhteyden muodostaminen ja hallinta

- [x] SERVER-tietojen välitys
- [x] READY-vaiheen valtuutustarkistus
- [x] CONNECTED-tilaan siirtyminen
- [x] Verkkotopologian rekisteröinti
- [x] PING/PONG-heartbeat
- [x] Kahden palvelimen välinen S2S-yhteys

3. Tapahtumien välitys

- [x] JOIN-tapahtumien välitys
- [x] IRC-viestien välitys
- [x] Palvelinten esittely ja edelleen välitys
- [x] Introduce-oikeuden tarkistus palvelimen esittelyssä

4. Valtuutus ja tietoturva

- [x] Sisään tulevan liikenteen keskitetty valtuutus (authorizeAction)
- [x] Lähtevän liikenteen valtuutus (authorizeOutbound)
- [x] Lähtevän liikenteen introduce-, route- ja sync-policy-tarkistukset
- [x] Luottamuksen peruuttaminen TrustRegistryssä
- [x] Palvelinten roolipohjaisen valtuutuksen peruslogiikka
- [ ]!!!!!! Luottamuksen menettäneen aktiivisen S2S-yhteyden sulkemisen tuotantotason toiminnan erillinen varmistus

5. Valtuutuksen kattavuus
- [x] Route- ja sync-valtuutuksen peruslogiikan testaus
- [x] Aktiivisen yhteyden oikeuksien uudelleenlukemisen testaus
- [x] Palvelinroolien peruslogiikan integraatiotestaus
- [x] Hyväksytyn palvelimen koko kättely
- [x] Kielletyn roolin hylkääminen READY-vaiheessa
- [x] Hylätyn palvelimen rekisteröitymisen eston testaus


Tässä viimeisessä kohdassa aiemmissa testeissä on kaksi eri asiaa:
 TrustRegistry-luottamuksen peruuttamista testattiin 4/4 
 ja aktiivisen yhteyden oikeuksien uudelleenlukemista authorizeAction-testissä 6/6. 
Jälkimmäinen käytti mockattua rekisteriä eikä yksin todista oikean TCP-yhteyden sulkeutumista.

#### Vielä toteutettava ja varmistettava
5. Valtuutuksen kattavuus

A: Perusominaisuudet on jo rakennettu. Kattavuus pitää vielä tarkistaa.
B: Toiminnallisuutta on jo toteutettu. Nyt tarvitaan kattavat verkkotestit.
C: Tuotantotason kovennukset ovat pääosin vielä avoimia, vaikka osa perustasta on jo olemassa.

A. Oikeuksien poistamisen vaikutus aktiiviseen yhteyteen	

- [ ] Route-oikeuden tarkistus kaikissa reititystoiminnoissa
- [ ] Sync-oikeuden tarkistus kaikissa synkronointitoiminnoissa
- [ ] Oikeuksien poistamisen vaikutuksen kattava testaus oikeassa aktiivisessa yhteydessä

B. S2S-toiminnan turvallisuustestit

- [ ] Kaksisuuntaisen liikenteen kattava testaus
- [ ] Yhteyden katkeamisen ja uudelleenyhdistämisen turvallisuustestit
- [ ] Etäkäyttäjien ja kanavien tilan eheyden testaus
- [ ] Netsplit-tilanteiden turvallisuustestit

C. Tuotantotason kovennukset

- [ ] TLS-salaus S2S-yhteyksille
- [ ] Credential management
- [ ] Vahvat palvelinkohtaiset salaisuudet
- [ ] Salaisuuksien kierrätys (key rotation)
- [ ] Replay-hyökkäysten esto
- [ ] Nonce- ja istuntokohtainen tunnistus
- [ ] Kaikkien S2S-pakettien alkuperän tarkistus
- [ ] Pakettien kokorajojen valvonta
- [ ] Syötteiden kattava validointi
- [ ] Rate limiting
- [ ] Yhteysmäärien rajoitukset
- [ ] Reitityssilmukoiden esto
- [ ] Duplikaattitapahtumien esto
- [ ] ID-törmäysten esto
- [ ] Turvallisuuslokitus ilman salaisuuksien vuotamista

### 13.2. IRC-Client Authentication = miten IRC-käyttäjä tunnistautuu IRC-palvelimelle

**Tarkistettavaa ja toteutettavaa:**
- [ ] IRC PASS -komennon käsittely, jos palvelimella vaaditaan salasana
- [ ] Käyttäjän tunnistautumistilan hallinta
- [ ] Salasanojen turvallinen tallennus ja vertailu
- [ ] Virheellisten tunnistetietojen hylkääminen
- [ ] Tunnistautumisen virhetilanteet
- [ ] Rekisteröitymisen ja tunnistautumisen oikea järjestys
- [ ] Yhteensopivuus käytettävien IRC-clientien kanssa
- [ ] Mahdollinen SASL-tuki erillisenä laajennuksena

### 13.3. IRC Operator Authentication (OPIT)= miten palvelimen ylläpitäjä tunnistautuu IRC-operaattoriksi

**Tarkistettavaa ja toteutettavaa:**
- [ ] OPER-komennon toteutus
- [ ] Operaattoritunnistetietojen hallinta
- [ ] Operaattoriksi tunnistautuminen
- [ ] Virheellisten operaattoritunnusten hylkääminen
- [ ] Operaattorioikeuksien myöntäminen
- [ ] Operaattorioikeuksien poistaminen
- [ ] Operaattorin oikeuksien tarkistus komentojen yhteydessä

### 13.4. Authorization & Permission Management = Mitä tunnistetut käyttäjät ja palvelimet saavat tehdä IRIS-verkossa

**Tarkistettavaa ja toteutettavaa:**
- [ ] IRC-käyttäjien oikeuksien tarkistus
- [ x] IRC operator -oikeuksien tarkistus
- [x ] Channel operator -oikeuksien tarkistus
- [x ] Voice-oikeuksien tarkistus
- [ ] Channel mode -muutosten käyttöoikeudet
- [x ] TOPIC-muutosten käyttöoikeudet
- [ ] Remote-clientien oikeuksien tarkistus
- [ ] Remote operator -oikeuksien yhdenmukaisuus
- [ ] Palvelinten välisten komentojen ja tapahtumien valtuutus
- [ ] Luvattomien toimintojen hylkääminen

### 13.5. Connection Security = IRC-clientien ja IRIS-palvelinten välisten yhteyksien suojaaminen

Connection Security = IRC-clientien ja IRIS-palvelinten välisten yhteyksien suojaaminen.

**Tarkistettavaa:**
- [ ] IRC-clientien TLS-yhteydet
- [ ] S2S-yhteyksien TLS-suojaus
- [ ] Sertifikaattien validointi
- [ ] Suojaamattomien yhteyksien käytännöt
- [ ] Tunnistetietojen suojaaminen lokituksessa
- [ ] Yhteyksien ja tunnistautumisyritysten rajoittaminen

**Tulos:**

- IRIS-palvelimet tunnistavat luotettavasti toisensa ennen verkkoon liittymistä.
- IRC-käyttäjien ja operaattorien tunnistautuminen voidaan toteuttaa hallitusti.
- Käyttöoikeudet tarkistetaan sekä paikallisessa IRC-toiminnassa että hajautetussa IRIS-verkossa.
- Palvelinten ja käyttäjien yhteydet voidaan suojata asianmukaisesti.


## 13. IRC Client Compatibility & Polish 🟡

IRC Client Compatibility = IRISin yhteensopivuuden ja käyttökokemuksen varmistaminen tavallisilla IRC-asiakasohjelmilla.

**Toteutettu:**
- IRC TCP -yhteydet
- NICK / USER
- JOIN / PART
- PRIVMSG / NOTICE
- Perusnumerics
- Perustoiminta IRC-clientillä

**Varmistettava:**
- [ ] Irssi-yhteensopivuus
- [ ] Muiden yleisten IRC-clientien yhteensopivuus
- [ ] IRC-komentojen parametrien käsittely
- [ ] IRC-numerics ja virheilmoitukset
- [ ] Prefixien ja käyttäjätietojen oikea esittäminen
- [ ] NAMES / WHO / WHOIS -toiminnallisuus
- [ ] PING / PONG ja yhteyden ylläpito
- [ ] Nick- ja käyttäjätilojen päivittyminen
- [ ] Kanavien ja käyttäjälistojen oikea esittäminen
- [ ] MODE- ja TOPIC-toiminnallisuus clientissä
- [ ] Disconnect- ja reconnect-käyttökokemus
- [ ] Viimeiset käytettävyys- ja virhetilanteet

**Tulos:**

- IRIS toimii yhteensopivasti valituilla IRC-asiakasohjelmilla.
- Käyttäjä voi liittyä IRIS-verkkoon ilman erillistä IRIS-clientiä.
- Tavallinen IRC-käyttö toimii johdonmukaisesti yhden ja useamman palvelimen verkossa.