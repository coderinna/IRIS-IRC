
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

Channel State Sync tarkoittaa sitä, miten IRC-kanavien tila pidetään yhdenmukaisena koko IRIS-verkon välillä.

Tavoitteena on, että kaikki verkon palvelimet ylläpitävät oikeaa tietoa kanavista, niiden jäsenistä, asetuksista ja reitityksestä.

### 10.1. CHANNEL STATE 🟡

Channel State = kanavan perustila ja sen synkronointi palvelinten välillä.

Toteutettu ja toimivaksi varmistettu:
- Channel name ✅
- Initial CHANNEL_STATE sync ✅
- Reconnect sync ✅
- CLIENT state sync ✅
Toteutettu, mutta vaatii vielä testausta:
- Channel servers 🟡 – servers-rakenne ja CHANNEL_STATE-kuljetus toimivat, mutta palvelinjoukon päivittyminen jäsenmuutosten yhteydessä vaatii testausta.
- Channel ownership 🟡 – ownerServerId välittyy CHANNEL_STATE-viestissä, mutta omistajan muodostumista ja muuttumista ei ole testattu erikseen.
- Channel modes state 🟡 – moodit sisältyvät kanavan tilaan, mutta kaikkien moodien synkronointi vaatii lisätestausta.

Tulos:
- IRIS välittää kanavien perustilan ja clientien tilatiedot palvelinten välillä.
- Initial CHANNEL_STATE- ja reconnect-synkronointi toimivat.
- Palvelinjoukon, omistajuuden ja moodien muutosten kattava synkronointi vaatii vielä testausta.

### 10.2. CHANNEL MEMBERSHIP 🟡

Channel Membership = miten käyttäjien jäsenyydet välitetään ja ylläpidetään palvelinten välillä.

Toteutettu ja toimivaksi varmistettu:
- JOIN state ✅
- PART state ✅
- Remote membership ✅
- Membership propagation ✅
- Remote-jäsenten näkyminen /NAMES-komennolla ✅
Toteutettu, mutta vaatii vielä testausta:
- Member removal 🟡 – PART toimii ja poistuminen propagoi, mutta reconnectin jälkeen tapahtuvaa jäsenen poistamista ei ole testattu erikseen.
- Empty channel cleanup 🟡 – remove-client.js ja kanavan cleanup-rakenne ovat olemassa, mutta viimeisen remote-käyttäjän poistumista ja sitä seuraavaa kanavan tyhjentymistä ei ole testattu verkon yli.

Tulos:
- IRIS välittää JOIN- ja PART-tapahtumat palvelinten välillä.
- Remote-jäsenyydet näkyvät verkon muilla palvelimilla.
- Jäsenen poistumisen ja tyhjentyneen kanavan siivoamisen reunatapaukset vaativat vielä testausta.

### 10.3. CHANNEL LIFECYCLE 🟡

Channel Lifecycle = miten kanava syntyy, löytyy ja poistuu IRIS-verkosta.

Toteutettu ja toimivaksi varmistettu:
- Local channel creation ✅
- Remote channel creation CHANNEL_STATE-vastaanotossa ✅
- Channel discovery reconnect recovery -tilanteessa ✅ – reconnect recovery palautti #test-kanavan iris-02-palvelimen NetworkManageriin.
Toteutettu, mutta vaatii vielä testausta:
- Channel remove 🟡 – removeChannel() on toteutettu, mutta verkon yli tapahtuvaa kanavan poistamista ei ole testattu.
- Empty channel cleanup 🟡 – paikallinen cleanup-rakenne on olemassa, mutta viimeisen jäsenen poistumisen jälkeistä kanavan poistamista ei ole testattu usean palvelimen verkossa.

Varmistettava:
- [ ] Kanavan ensimmäisen luonnin päästä päähän -testi kahden palvelimen välillä
- [ ] Kanavan poistumisen testaus koko verkossa
- [ ] Viimeisen jäsenen poistumisen jälkeisen tyhjennys- ja poistumisprosessin testaus usean palvelimen verkossa

Tulos:
- IRIS pystyy luomaan paikallisia ja vastaanottamaan remote-kanavia.
- Kanavien löytyminen reconnect recovery -tilanteessa on varmistettu.
- Kanavan poistuminen ja tyhjentyneen kanavan poistaminen koko verkosta vaativat vielä testausta.

### 10.4. CHANNEL MODES 🟡

Channel Modes = kanavan asetusten, käyttöoikeuksien ja viestirajoitusten hallinta sekä niiden välittäminen palvelinten välillä.

Toteutettu:

S2S-protokolla ja viestinkäsittely:
- MODE S2S -viestirakenne
- MODE encode/decode TLV-muodossa
- MODE-viestityypin rekisteröinti protokollaan
- MODE-vastaanottokäsittelijä
- MODE-tapahtuman lähetys S2S-managerista
- MODE-propagointi muille palvelimille kooditasolla
- Message ID:n säilyttäminen edelleen välitettäessä
Identiteetti ja oikeudet:
- Remote-clientin identiteetin ja kanavajäsenyyden tarkistukset
- Operaattorioikeuden tarkistus vastaanotossa
- Paikallisten käyttäjien ilmoittaminen remote MODE-muutoksista
Moodien käsittely:
- +i – käsittely vastaanotossa
- +o – käsittely vastaanotossa
- +v – käsittely vastaanotossa
- +m – käsittely vastaanotossa
- +n – käsittely vastaanotossa
- +t – käsittely vastaanotossa
- Paikallinen +m-viestirajoitus
- S2S-reitityksen +m-viestirajoitus
- Paikallinen +n-jäsenyystarkistus
- S2S-reitityksen +n-jäsenyystarkistus
- Moodikohtainen käsittely: i, k, l, m, n, o, t, v

Toiminnallisesti varmistettu:
- +t – topicin muuttamisen oikeusrajoitus
- +k – kanavasalasanan toiminta
- +l – käyttäjämäärän rajoitus

Varmistettava:
- [ ] +m-moodin toiminnallinen testaus
- [ ] +n-moodin toiminnallinen testaus
- [ ] +v-moodin toiminnallinen testaus
- [ ] Kaikkien moodien CHANNEL_STATE-synkronointi
- [ ] MODE-muutosten reconnect-synkronointi
- [ ] Yli kahden palvelimen MODE-testit
- [ ] MODE-testit eri kanavilla ja useilla samanaikaisilla kanavilla
- [ ] Virheellisten moodikirjainten ja parametrien käsittely

MODE-oikeuksien reunatapaukset:
- [ ] Operaattori poistaa omat oikeutensa
- [ ] Operaattori yrittää antaa oikeudet kanavan ulkopuoliselle
- [ ] Tavallinen käyttäjä yrittää muuttaa moodia
- [ ] Tuntematon moodikirjain
- [ ] Virheelliset MODE-parametrit
- [ ] Remote-operaattorin oikeuksien tarkistus

Tulos:
- MODE-viestien S2S-rakenne, lähetys, vastaanotto ja edelleenreititys on toteutettu.
- Keskeisten moodien käsittely ja käyttöoikeustarkistukset ovat olemassa.
- Moodien kattava toiminnallinen testaus, synkronointi ja reunatapaukset vaativat vielä varmistamista.

### 10.5. CHANNEL TOPIC Valmis

Channel Topic = kanavan näkyvän aiheen tai kuvauksen hallinta ja välittäminen palvelinten välillä.

Toteutettu:
- TOPIC-viestin oma S2S-tyyppi (0x19)
- TOPIC-viestin encode/decode TLV-rakenteella
- TOPICin lähetys palvelimelta toiselle
- Vastaanottavan palvelimen topic-tilan päivitys
- TOPICin edelleen välitys muihin palvelimiin
- Paikallisten käyttäjien ilmoittaminen muutoksesta
- +t-oikeuksien tarkistus
- Tyhjän topicin käsittely eli topicin poistaminen
- ACK-seuranta

Tulos:
- TOPIC-tila välittyy palvelinten välillä.
- Topic-muutokset päivittyvät vastaanottaville palvelimille ja näkyvät paikallisille käyttäjille.
- Topicin asettaminen, muuttaminen ja poistaminen on toteutettu.

### 10.6. CHANNEL ROUTING STATE 🟡

Channel Routing State = tieto siitä, missä palvelimissa tietty kanava ja sen jäsenet sijaitsevat, jotta kanavaliikenne voidaan reitittää oikeisiin suuntiin.

Toteutettu:
- Channel state ✅
- Remote membership ✅
- Message routing ✅
- S2S MESSAGE ✅
Vaatii vielä varmistamista:

- Server information 🟡 – palvelintietojen ja kanavakohtaisen palvelinrakenteen kattava ylläpito ja päivittyminen.

Tulos:
- IRIS pystyy välittämään kanavaliikennettä palvelinten välillä.
- Remote-jäsenyydet ja kanavatiedot ovat reitityksen perustana.
- Palvelintietojen kattava ylläpito ja reititystilan muutostilanteet vaativat vielä testausta.

## 11. S2S Reliability  🟡

S2S Reliability tarkoittaa sitä, miten IRIS-palvelinten välinen verkkoyhteys ja viestinvälitys toimivat virhe-, katkos- ja palautumistilanteissa.

Keskeinen tavoite on varmistaa, että S2S-yhteydet, viestiliikenne ja palvelinten välinen reititys toimivat luotettavasti myös poikkeustilanteissa.

Toteutettu:
- Message validation
- Frame validation
- Message deduplication
- ACK handling
- Connection state validation
- Connection cleanup
- Sequence number handling (perustoiminta)

Varmistettava:
- [ ] Virheellisten ja vanhojen sequence number -arvojen käsittely
- [ ] Puuttuvien ACK-kuittausten ja timeoutien käsittely
- [ ] Duplikaattiviestien eston toiminta virhetilanteissa
- [ ] Virheellisten tai puutteellisten viestien käsittely
- [ ] Odottamattomien viestien käsittely eri yhteystiloissa
- [ ] S2S-yhteyden katkeaminen kesken viestinvälityksen
- [ ] Reconnect ja S2S-yhteyden palautuminen
- [ ] Vanhentuneiden reittitietojen poistaminen
- [ ] Samanaikaisten S2S-yhteyskatkojen käsittely
- [ ] Netsplit-tilanteiden käsittely ja niistä palautuminen
- [ ] Osittaisen verkkokatkon jälkeinen yhteyksien palautuminen
- [ ] Viestien silmukkareitityksen eston toiminta
- [ ] Palvelinten ristiriitaisen verkkotilan tunnistaminen ja ratkaiseminen

Tulos:
- IRISin S2S-yhteyksien ja viestinvälityksen virhetilanteiden hallinta varmistetaan järjestelmällisesti.
- Yhteyskatkot eivät saa jättää verkkoon virheellisiä tai vanhentuneita reititystietoja.
- Palvelinten välisten yhteyksien tulee palautua hallitusti katkosten jälkeen.
- Netsplit- ja osittaisten yhteyskatkojen käsittely varmistetaan usean palvelimen testeillä.

## 12. Authentication & Authorization 🟡

### 12.1. S2S Security

Rakennettu on paljon enemmän kuin pelkän IRC-palvelinten välisen kirjautumisen.
Nyt testataan, kestääkö IRIS myös oikean hajautetun IRC-verkon häiriöitä ja hyökkäystilanteita.

Toteutettu
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
- [x] Sisään tulevan ROUTE- ja SYNC-liikenteen valtuutustarkistukset
- [x] Lähtevän ROUTE- ja SYNC-liikenteen valtuutustarkistukset
- [x] Kielletyn liikenteen estäminen ennen lähetystä tai käsittelyä

5. Valtuutuksen kattavuus ja testaus
- [x] Route- ja sync-valtuutuksen peruslogiikan testaus
- [x] Kaikkien kahdeksan ROUTE-kehystyypin sisään tulevan valtuutuksen testaus
- [x] Molempien SYNC-kehystyyppien sisään tulevan valtuutuksen testaus
- [x] Kaikkien kahdeksan ROUTE-kehystyypin lähtevän valtuutuksen testaus
- [x] Molempien SYNC-kehystyyppien lähtevän valtuutuksen testaus
- [x] Kiellettyjen lähtevien kehysten lähetyksen estäminen
- [x] TrustRegistry-luottamuksen peruuttamisen vaikutuksen testaus
- [x] Peruutetun palvelimen ROUTE- ja SYNC-valtuutuksen hylkääminen
- [x] Epäonnistuneen lähetyksen ACK-seurannan siivoaminen
- [x] Aktiivisen S2S-yhteyden socketin sulkemisen toiminnan testaus
- [x] Lopullinen S2S-valtuutuksen integraatiotesti: 47/47 hyväksytty

6. Aktiivisen yhteyden oikeuksien peruuttaminen
- [x] TrustRegistry-luottamuksen peruuttamisen kytkeminen aktiivisten yhteyksien sulkemiseen tuotantotason toiminnassa
- [x] Managerin kautta tehtävän luottamuksen peruuttamisen testaaminen oikealla aktiivisella S2S-yhteydellä
- [x] Route-oikeuden poistamisen vaikutuksen testaaminen aktiivisessa yhteydessä
- [x] Sync-oikeuden poistamisen vaikutuksen testaaminen aktiivisessa yhteydessä
- [x] Oikeuksien poistamisen vaikutuksen varmistaminen kaikissa reititys- ja synkronointitoiminnoissa

## Kohta	Mitä IRISissä on tehty

* TLS S2S-yhteyksille	Palvelimen valtuutus tarkistaa TLS-vaatimuksen.
* Palvelinkohtaiset salaisuudet	TrustRegistry tallentaa palvelimen serverId- ja secret-tiedot.
* Salaisuuden vertailu	verifySecret() käyttää crypto.timingSafeEqual-vertailua.
* Replay-/duplikaattiviestien esto	messageId-tunniste tarkistetaan ennen viestin käsittelyä.
* Viestijärjestyksen tarkistus	validateSequence tarkistaa saapuvan kehyksen sekvenssin.
* Viestitunnisteiden validointi	validateMessageId tarkistaa viestitunnisteen ennen käsittelyä.
* Pakettien syötevalidointi	S2S-kehysten ja esimerkiksi CHANNEL_STATE-viestien kenttiä validoidaan.
* Rate limiting	validateRateLimit on kytketty saapuvien kehysten validointiin.
* Palvelimen luotettavuuden tarkistus	authorizeServer() tarkistaa TrustRegistry-merkinnän.
* Roolien ja kyvykkyyksien tarkistus	Palvelimen roolit ja vaaditut capabilities tarkistetaan.
* Aktiivisen yhteyden oikeuksien poisto	TrustRegistry-revokaatio sulkee aktiivisen yhteyden. Tämä testattiin integraatiotestillä.
* Turvallinen asiakasidentiteetti	Asiakkailla on UUID-pohjainen clientId ja palvelinkohtainen identiteetti.
* Duplikaattiviestien esto on toteutettu yhteyskohtaisella messageIds-Setillä. Sen historia on rajattu maxMessageIds-arvolla, joten kyseessä ei ole rajattomasti kasvava muistirakenne.

## Osittain toteutettu tai vaatii lisävarmistuksen

* TLS-salauksen kattavuus	TLS-vaatimus tarkistetaan valtuutuksessa, mutta koko yhteyden muodostuksen ja sertifikaattien hallinnan kattavuus pitää vielä varmistaa.
* Replay-hyökkäysten esto	Sekvenssi- ja messageId-tarkistukset ovat olemassa. Viestitunnisteiden historia on kuitenkin yhteyskohtainen ja rajattu.
* Pakettien kokorajojen valvonta	Varsinaista kattavaa kokorajojen toteutusta ei ole vielä vahvistettu.
* Kaikkien S2S-pakettien alkuperän tarkistus	Yhteyden ja etäasiakkaan identiteettiä tarkistetaan esimerkiksi JOIN-käsittelyssä. Kaikkien viestityyppien kattavuus pitää vielä tarkistaa.
* Syötteiden kattava validointi	Useita validointikerroksia on olemassa, mutta kaikkien frame-tyyppien kattavuus ei ole vielä todistettu.
* Reitityssilmukoiden esto	Ei vielä vahvistettua näyttöä kattavasta toteutuksesta.
* ID-törmäysten esto	UUID-pohjainen tunnistus on käytössä, mutta törmäysten käsittelyä ei ole erikseen vahvistettu.

## Vielä tekemättä tai vahvistamatta

- Credential management eli keskitetty tunnistetietojen hallinta.
- Salaisuuksien turvallinen tallennus pysyvästi.
- Salaisuuksien kierrätys eli key rotation.
- Nonce- ja istuntokohtainen tunnistus erillisenä mekanismina.
- Yhteysmäärien rajoitukset.
- Turvallisuuslokituksen kattava tarkistus, jotta salaisuudet tai tunnistetiedot eivät vuoda lokeihin.
- Yksittäisten toimintojen keskitetty valtuutus jokaiselle S2S-kehykselle. authorizeServer() on olemassa, mutta esimerkiksi introduce-, route- ja sync-toimintojen keskitetty tarkistus oli vielä kesken.

### 12.2. IRC-Client Authentication = miten IRC-käyttäjä tunnistautuu IRC-palvelimelle

**Tarkistettavaa ja toteutettavaa:**
- [ ] IRC PASS -komennon käsittely, jos palvelimella vaaditaan salasana
- [ ] Käyttäjän tunnistautumistilan hallinta
- [ ] Salasanojen turvallinen tallennus ja vertailu
- [ ] Virheellisten tunnistetietojen hylkääminen
- [ ] Tunnistautumisen virhetilanteet
- [ ] Rekisteröitymisen ja tunnistautumisen oikea järjestys
- [ ] Yhteensopivuus käytettävien IRC-clientien kanssa
- [ ] Mahdollinen SASL-tuki erillisenä laajennuksena

### 12.3. IRC Operator Authentication (OPIT)= miten palvelimen ylläpitäjä tunnistautuu IRC-operaattoriksi

**Tarkistettavaa ja toteutettavaa:**
- [ ] OPER-komennon toteutus
- [ ] Operaattoritunnistetietojen hallinta
- [ ] Operaattoriksi tunnistautuminen
- [ ] Virheellisten operaattoritunnusten hylkääminen
- [ ] Operaattorioikeuksien myöntäminen
- [ ] Operaattorioikeuksien poistaminen
- [ ] Operaattorin oikeuksien tarkistus komentojen yhteydessä

### 12.4. Authorization & Permission Management = Mitä tunnistetut käyttäjät ja palvelimet saavat tehdä IRIS-verkossa

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

### 12.5. Connection Security = IRC-clientien ja IRIS-palvelinten välisten yhteyksien suojaaminen

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
