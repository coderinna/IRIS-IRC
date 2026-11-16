# IRIS-S2S-protocol-v2

IRIS osoittanut alustavasti toimivan lähestymistavan
yhden IRC-infrastruktuurin keskeisistä luotettavuusongelmista 
omalla protokolla toteutuksellaan.

## Protokolla edellä ratkaisu

Tässä ei enää vain korjata vanhaa IRCd:tä.
Tässä tutkitaan uudenlaista IRC-verkon toimintamallia.

Yksikään muu IRC daemond ei ratkaise netsplittiä oman S2S-protkolonnan avulla.
Ollaanko tilanteessa , että voidaa oman binääri protokollan avulla ratkaista tilanne,johon
vanhemmat C pohjoaiset daemondit eivät pysty oman rakenteensa takia ?
IRC:n perinteinen palvelinverkko perustuu puumaiseen topologiaan (Spanning Tree)
ja erillisiin Services palvelimiin NickSerc, Channel Serv. (Anope/Antheme kerros)
, jossa yksittäisen palvelinyhteyden katkeaminen voi jakaa verkon. 

IRIS-S2S v2:n tapahtumapohjainen synkronointi lähestyy ongelmaa eri tavalla: sen sijaan, että vain vaihdettaisiin uudelleen palvelinten käyttäjä- ja kanavatietoja, voidaan palauttaa ja yhtenäistää tapahtumahistoriaa.

Alettu miettimään Matrixia . IRIS puhuisi ulospäin IRC:ä niinku on nyt , 
mutta toimii ulos kuin kevytm, binäärinen Matrix. Halutaan
IRC nopeus, keveys, client ekosysteemi, mutta päästäisi eroo 1980 luvu
puumaista verkkoahtiiruin haavoittuvuuksista. 
Matrixista ei haluta sen raskasta lasketnaaa ja JSONia.

Yksikään valtavirran IRC-daemondi ei lähesty ongelmaa tälllä tavalla.

## Tavoite

* IRIS-S2S pystyy palauttamaan hajautetun IRC-verkon yhtenäiseen ja deterministiseen tilaan verkkokatkon eli netsplitin jälkeen.

### Esimerkki
- A:ssa käyttäjä liittyy kanavalle.
- B:ssä käyttäjä poistetaan kanavalta samaan aikaan.
- B ei ole nähnyt A:n JOIN-tapahtumaa.
- Palvelimet yhdistyvät uudelleen.

Jos IRIS protokolla vol 2 pystyy säilyttämään molemmat tapahtumat ja ratkaisemaan jäsenyyden oikein, meillä on ensimmäinen askel kohti oikeasti hajautettua kanavatilaa.


## Tutkimus kysymykset

*  Pystyykö palauttamaan hajautetun IRC-verkon yhtenäiseen ja deterministiseen tilaan verkkokatkon eli netsplitin jälkeen?
* Voiko netsplitistä tehdä tilanteen, jossa verkko ei koskaan oikeasti menetä yhteistä historiaansa?
* Palvelimet voivat olla erillään, hyväksyä muutoksia itsenäisesti ja yhdistää historiansa myöhemmin?
* Miten varmistamme, ettei vanhaa tapahtumaa tarvitse enää mikään verkon palvelin ennen sen poistamista?

##  **IRIS protocol-v2 – testauksen tilanne**

## **1. Nykyinen toteutus ja perustestit**

- Kolme erillistä TCP-palvelinprosessia
- Netsplitin simulointi ja yhteyden palauttaminen
- Tapahtumien palautuminen katkon jälkeen
- Puuttuvan sekvenssin tunnistaminen ja korjaaminen

## **2. Netsplit-kestävyys**

- Toistuvat netsplitit ja reconnectit – kolme peräkkäistä kierrosta TCP-testeissä
- [\~] Rinnakkaiset muutokset verkon eri puolilla – molemmat puolet tekivät itsenäisiä muutoksia katkon aikana, mutta varsinaista samanaikaisuustestiä ei vielä ole
- Useiden samanaikaisten tapahtumien palautuminen
- [\~] Useat puuttuvat sekvenssit ja sekvenssiaukot – yhden puuttuvan sekvenssin korjaus testattu
- Duplikaattien hylkääminen – simulaattoritesteissä
- Duplikaattien ja sekvenssikonfliktien käsittely oikeassa TCP-verkossa
- Palvelimen kaatuminen ja uudelleenkäynnistys

## **3. Monipalvelinverkko**

- Kolmen palvelimen verkon palautuminen
- Vähintään neljän palvelimen palautumistesti
- [\~] Verkkotopologian palautuminen – simulaattoritesteissä
- Vaihtoehtoisten verkkoreittien testaus TCP-verkossa
- Usean verkon osan samanaikainen eriytyminen
- Kaikkien kolmen palvelimen tapahtumahistorioiden yhtenevyys – TCP-testeissä
- Kaikkien kolmen palvelimen lopputilojen yhtenevyys – TCP-testeissä

## **4. Luotettavuus ja turvallisuus**

- [\~] Virheellisten tapahtumien hylkääminen – simulaattorin aiemmissa testeissä osittain
- Virheellisten TCP-viestien kattava testaus
- Virhetilanteista palautuminen
- Suuren tapahtumahistorian synkronointi
- Synkronoinnin päättyminen ilman viestikierrettä
- Palvelinten autentikointi ja tapahtumien alkuperän tarkistus

## **5. Lopullinen hyväksyntä**

- Kaikki kriittiset testit läpäisty
- [\~] Tapahtumia ei katoa eikä käsitellä kahdesti – simulaattorissa duplikaattien hylkäys testattu, TCP-kattavuus kesken
- Kaikki kolme TCP-palvelinta saavuttavat saman lopputilan testatuissa palautumistilanteissa
- Testit ovat automaattisesti toistettavissa

**Merkintöjen selitys:**

- Valmis &#x20;Testattu ja läpäisty.

-Osittain &#x20;Testattu rajatusti tai vain simulaattorissa.

-  Avoin &#x20;Ei vielä riittävästi testinäyttöä.

# **Tärkein saavutus:** 15-16.11.2026 välinen yö

IRIS protocol-v2:n kolmen erillisen TCP-palvelimen verkko selviytyi kolmesta peräkkäisestä netsplitistä, palautti tapahtumahistoriat ja saavutti yhtenevän lopputilan.
Tämä on nyt oikeasti testattu, ei pelkkä simulaatiotulos.

* Palvelinkohtaiset sekvenssinumerot kertovat, mihin asti tapahtumahistoria ulottuu.
* Kausaalikonteksti auttaa ymmärtämään tapahtumien välisiä riippuvuuksia.
* Puuttuvien tapahtumien tunnistus mahdollistaa täsmäkorjauksen.
* Näiden päälle voidaan rakentaa tilannekuvat ja vanhojen tapahtumien turvallinen siivous.
