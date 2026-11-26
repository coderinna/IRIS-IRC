# IRIS-protocol-S2S-v2 

Tavoitteena oli lähteä rakentamaa IRC-infrastruktuuri, jossa oma palvelinten välinen protokolla mahdollistaa hajautetun verkon palautumisen verkkokatkoista eli netsplitistä.

IRIS on osoittanut alustavasti toimivan lähestymistavan yhteen IRC-infrastruktuurin keskeisistä luotettavuushaasteista: verkkotilan palauttamiseen palvelinten välisen yhteyskatkon jälkeen (netsplit).

IRIS-S2S Protocol v2 tutkii omaan tapahtumapohjaiseen synkronointiin perustuvaa tapaa palauttaa ja yhtenäistää IRC-verkon tila netsplitin jälkeen. Perinteisen palvelinverkkosynkronoinnin sijaan lähestymistavan perustana ovat **palvelinkohtaiset tapahtumahistoriat, kausaalinen säilyttäminen ja puuttuvien tapahtumien palauttaminen**.

Tavoite, että IRIS-S2S pystyy palauttamaan hajautetun 
**IRC-verkon yhtenäiseen ja deterministiseen tilaan** verkkokatkon jälkeen.

Tähän mennessä saavutettu: 16.11.2026 kello 01:00 (Suomen aika):  kolme erillistä TCP-palvelinta selviytyi kolmesta peräkkäisestä netsplitistä ja **saavutti yhtenevän lopputilan**.
* tapahtumahistoria
* kausaalinen järjestys
* JOIN/PART-konfliktit 
* kolmen palvelimen netsplit-palautuminen 
* oikeiden TCP-palvelinprosessien välinen synkronointi.

Tulos on vahvistettavissa projektin dokumentaatiosta, koodista löytyvistä testeistä ja niiden testien tuloksista. Proto-v2 ja netsplit-kestävyyttä tutkitaan edelleen laajemmalla testauksella. Alustava tulos on hyvä ja osoittaa, että lähestymistavalla on jonkin asteinen potentiaalia.


IRIS-S2S v2:n tavoitteena on tutkia, voidaanko tällä lähestymistavalla saavuttaa deterministinen ja yhtenäinen kanavajäsenyys myös toistuvien verkkokatkosten jälkeen.


| Osa-alue | Nykyinen tilanne |
|---|---|
| **Tapahtumien yksilöinti** | `serverId + sequence` |
| **Tapahtumahistoria** | Palvelinkohtainen tapahtumaloki |
| **Kausaalinen järjestys** | `causalContext` |
| **Puuttuvien tapahtumien tunnistus** | Sekvenssinumeroiden vertailu |
| **JOIN/PART-konfliktit** | Kausaalinen jäsenyyden palautus |
| **Netsplit-palautuminen** | Usean palvelimen synkronointi |
| **TCP-synkronointi** | Kolmen erillisen prosessin testit |
| **Duplikaattien käsittely** | Testattu |
| **Toistuvat netsplitit** | Kolme peräkkäistä sykliä testattu |

IRIS pyrkii palauttamaan hajautetun jäsenyystilan säilyttämällä tapahtumien kausaalisen merkityksen myös silloin, kun palvelimet ovat tehneet toisistaan riippumattomia muutoksia verkkopartition aikana.

## Protokolla edellä ratkaisu

Tässä tutkitaan uudenlaista IRC-verkon toimintamallia, jota yksikään valtavirran IRC-daemondi ei näytä lähesty ongelmaa tällä tavalla nykyhetkellä.

IRIS-S2S v2:n tapahtumapohjainen synkronointi lähestyy ongelmaa eri tavalla: sen sijaan, että vain vaihdettaisiin uudelleen palvelinten käyttäjä- ja kanavatietoja, voidaan palauttaa ja yhtenäistää tapahtumahistoriaa.

IRIS:n kehityksessä on alettu tutkia arkkitehtuuria, jossa yhdistyvät IRC:n keveys, nopeus ja laaja asiakasekosysteemi sekä modernin hajautetun viestintäverkon toimintaperiaatteet.

Tavoitteena on säilyttää IRC-yhteensopivuus ulospäin, jotta nykyiset IRC-clientit ja niiden ekosysteemi säilyvät käytettävissä. Verkon sisäinen toiminta ei kuitenkaan olisi sidottu perinteiseen IRC-palvelinarkkitehtuuriin tai sen puumaiseen Spanning Tree -topologiaan.

Arkkitehtuurin suunnittelussa haetaan vaikutteita esimerkiksi Matrixin hajautetusta toimintamallista, mutta ilman sen raskasta tapahtumamallia, JSON-pohjaista tiedonsiirtoa ja tarpeettoman suurta laskennallista kuormaa.

IRIS ei siis pyri rakentamaan uutta IRC-client-ekosysteemiä eikä kopioimaan Matrixia. Tavoitteena on yhdistää perinteisen IRC:n käytännölliset vahvuudet modernimpaan, omaan binääriseen verkkoarkkitehtuuriin.

## Kysymykset

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

# **Tärkein saavutus:** 15.11.2026 

IRIS protocol-v2:n kolmen erillisen TCP-palvelimen verkko selviytyi kolmesta peräkkäisestä netsplitistä, palautti tapahtumahistoriat ja saavutti yhtenevän lopputilan.
Tämä on nyt oikeasti testattu, ei pelkkä simulaatiotulos.

* Palvelinkohtaiset sekvenssinumerot kertovat, mihin asti tapahtumahistoria ulottuu.
* Kausaalikonteksti auttaa ymmärtämään tapahtumien välisiä riippuvuuksia.
* Puuttuvien tapahtumien tunnistus mahdollistaa täsmäkorjauksen.
* Näiden päälle voidaan rakentaa tilannekuvat ja vanhojen tapahtumien turvallinen siivous.

# IRIS-S2S v2:n tekninen ero perinteisiin IRC-palvelinprotokolliin

Tunnetut IRC-daemonit, kuten InspIRCd ja UnrealIRCd, käyttävät omia palvelinten välisiä protokolliaan ja tarjoavat mekanismeja palvelinyhteyksien palauttamiseen sekä verkon tilan uudelleensynkronointiin.

IRIS-S2S v2 tutkii tästä poikkeavaa lähestymistapaa: palvelinten välisen synkronoinnin perustana ei ole ainoastaan nykyisen verkkotilan välittäminen, vaan palvelinkohtaisen tapahtumahistorian säilyttäminen ja yhdistäminen.

Tarkasteltujen tunnettujen IRC-daemonien julkisesta teknisestä dokumentaatiosta ei löytynyt vastaavaa kokonaisuutta, jossa verkkopartition aikana syntyneitä itsenäisiä muutoksia palautettaisiin palvelinkohtaisten tapahtumahistorioiden ja kausaalisten riippuvuuksien avulla.
