# NAMES
NAMES #test ei tässä vaiheessa voi näyttää mitään, koska IRISissä ei vielä ole NAMES-komentoa.
Routeriii aloita lisäää NAMES
Myöhemmin tehdään se kunnolla niin, että se osaa lukea sekä paikalliset 
että verkosta tulleet jäsenet ja palauttaa normaalit 353/366-vastaukset


### Jäljellä oleva ydintyö

Joo. Nyt kun **oikeat testit on tehty**, päivittäisin listan näin. En merkitsisi kaikkea `Propagation`-kohdassa valmiiksi vain siksi, että peruskomento on toteutettu — erotetaan **toteutettu** ja **todistetusti toimiva**.

### 🌸 IRIS multi-server network — nykytila

#### 1. **Propagation**

✅ NICK — toteutettu ja testattu
✅ JOIN — toteutettu ja S2S-testattu
✅ PART — toteutettu ja S2S-testattu
✅ QUIT — toteutettu ja S2S-testattu
🟡 NOTICE — toteutus olemassa, S2S-testi puuttuu
✅ MESSAGE — end-to-end testattu IRC-clienteillä

---

#### 2. **Routing**

- ✅ **CLIENT → CLIENT** — remote → local toimii
- ✅ **`/msg` palvelinten yli** — testattu oikealla Irssillä
- ✅ **Channel MESSAGE** — testattu, molemmat IRC-clientit näkevät viestin
- 🟡 **oikea next-hop** — pitää vielä testata kunnolla `iris-01 → iris-02 → iris-03`
- 🟡 **ei takaisin tulosuuntaan** — ketjutestillä varmistettava
- 🟡 **network/routing + s2s/routing vastuiden selkeytys** — seuraava routing-työ

Tuo viimeinen on se **isompi routing-osio**, josta juuri puhuttiin.


# 🌸 IRIS Routing — muistilista

## 1. Routing-kerrosten vastuut

### `src/network/routing/`
**Network-level routing**

Vastaa kysymyksestä:

> Missä palvelimessa kohde sijaitsee ja mitä reittiä sinne kuljetaan?

- Server identity
- Client → server -sijainti
- Server topology
- Route `serverId`:n perusteella
- Next-hopin määrittäminen
- Reitti palvelinten välillä

Periaate:

```text
target
  ↓
target server
  ↓
network routing
  ↓
next-hop
  ↓
S2S connection
```

---

### `src/s2s/routing/`
**Message-level routing**

Vastaa kysymyksestä:

> Mitä vastaanotetulle MESSAGE-framelle tehdään?

Nykyinen rakenne:

```text
MESSAGE
   ↓
resolveTarget()
   ↓
┌──────────────┬──────────────┬───────────┐
│ local-client │ remote-client│ channel   │
└──────┬───────┴───────┬──────┴─────┬─────┘
       ↓               ↓            ↓
   Client.send()    getRoute()    members
```

Tärkeä periaate:

> S2S routing päättää MESSAGE:n kohteen.  
> Network routing päättää, mitä S2S-reittiä pitkin kohteeseen mennään.

---

# 2. Nykyinen ongelmakohta

Aiemmin MESSAGE outbound -käsittely käytti:

```text
manager.connections
        ↓
kaikille connected-yhteyksille
```

eli broadcast-tyyppistä lähetystä.

Oikean tavoitteen pitää olla:

```text
MESSAGE
   ↓
target
   ↓
target server
   ↓
network routing
   ↓
next-hop
   ↓
vain oikea S2S connection
```

Esimerkiksi:

```text
iris-01
   │
   ▼
iris-02
   │
   ▼
iris-03
   │
   ▼
nina
```

Ei:

```text
iris-01
 ├──→ iris-02
 └──→ iris-03
```

---

# 3. Next-hop

Testattava erityisesti kolmen palvelimen ketjussa:

```text
iris-01 → iris-02 → iris-03
```

Tarkistetaan:

- 🟡 löytääkö `iris-01` oikean target serverin
- 🟡 valitaanko `iris-02` next-hopiksi
- 🟡 välittääkö `iris-02` viestin `iris-03`:lle
- 🟡 päätyykö viesti lopulta oikealle clientille

---

# 4. Ei takaisin tulosuuntaan

Kun MESSAGE tulee:

```text
iris-02 → iris-03
```

iris-03 ei saa lähettää sitä takaisin:

```text
iris-03 → iris-02 ❌
```

Tarkistettava:

- connection, josta frame tuli
- target server
- next-hop
- route === incoming connection
- duplicate prevention
- message ID

Tavoite:

```text
iris-01 → iris-02 → iris-03
                         │
                         ▼
                       client
```

Ei:

```text
iris-01 → iris-02 → iris-03
              ↑         │
              └─────────┘ ❌
```

---

# 5. Remote client routing

Kun kohde on toisella palvelimella:

```text
resolveTarget()
      ↓
remote-client
      ↓
client.serverId
      ↓
network routing
      ↓
getRoute(serverId)
      ↓
next-hop
```

Tarkistettava:

- client identity
- `serverId`
- target server
- route
- connection state
- incoming connectionin ohittaminen
- vain yksi next-hop

---

# 6. Channel routing

Channel on eri asia kuin yksittäinen client.

```text
MESSAGE → #test
           ↓
      channel state
           ↓
      channel members
           ↓
   ┌───────┴────────┐
   ↓                ↓
 local            remote
 client            client
                    ↓
                 next-hop
```

Tarkistettava:

- ketkä ovat kanavalla
- paikalliset jäsenet
- remote-jäsenet
- sama viesti vain kerran per next-hop
- lähettäjää ei palauteta takaisin
- incoming connectionia ei käytetä takaisinreititykseen
- useita remote-clienteja samalla serverillä → yksi S2S-lähetys

---

# 7. Broadcast pois routing-pathista

Broadcast voi olla hyödyllinen joissakin propagation-tapahtumissa, mutta **targetoitua MESSAGE:a ei pitäisi lähettää kaikille palvelimille**.

Erotettava:

```text
Propagation
    ↓
verkoston state-tapahtuma
```

vs.

```text
Routing
    ↓
tietty target
```

MESSAGE:

```text
targeted routing
```

CLIENT/NICK/JOIN/QUIT:

```text
state propagation
```

Näiden vastuut pitää pitää selkeinä.

---

# 8. Testimatriisi

### Yksi palvelin

```text
Bob → nina
```

- ✅ local → local

### Kaksi palvelinta

```text
Bob@iris-02 → nina@iris-03
```

- ✅ private MESSAGE
- ✅ channel MESSAGE

### Kolme palvelinta

```text
Bob@iris-01
      ↓
iris-02
      ↓
nina@iris-03
```

- 🟡 oikea next-hop
- 🟡 ei broadcastia
- 🟡 ei takaisinreittiä
- 🟡 ACK
- 🟡 lopullinen client delivery

### Channel kolmella palvelimella

```text
#test

iris-01: Bob
iris-02: Alice
iris-03: Nina
```

Testataan:

```text
Bob → #test
```

Odotus:

```text
Alice ✅
Nina  ✅
Bob   ✅ / paikallinen näyttö IRC:n normaalin käytöksen mukaan
```

ja S2S-verkossa vain tarvittavat reitit.

---

# 9. Lopullinen tavoite

Routing-arkkitehtuuri:

```text
                 IRIS MESSAGE
                      │
                      ▼
                resolveTarget
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        local       remote      channel
        client       client       │
          │           │           ▼
          │           │       channel state
          │           │           │
          │           ▼      local / remote
          │      target server      │
          │           │            │
          │           ▼            ▼
          │    network/routing   next-hop
          │           │            │
          └───────────┴────────────┘
                      │
                      ▼
                S2S connection
```

## 🎯 Työjärjestys

1. 🔜 Selvitä `network/routing` nykyinen vastuu
2. 🔜 Selvitä `s2s/routing` nykyinen vastuu
3. 🔜 Varmista ettei samaa routing-päätöstä tehdä kahdessa paikassa
4. 🔜 Korjaa target → server → next-hop -ketju
5. 🔜 Testaa `iris-01 → iris-02 → iris-03`
6. 🔜 Varmista ettei viesti palaa tulosuuntaan
7. 🔜 Viimeistele channel routing
8. 🔜 Sen jälkeen channel sync kokonaisuutena

---

#### 3. **Channel Sync**

- 🟡 **kuka kuuluu mihinkin kanavaan**
- 🟡 **channel creation/removal**
- 🟡 **JOIN/PART**
- 🟡 **channel modes**
- 🟡 **jäsenyyden synkronointi palvelinten välillä**

Tämä on edelleen iso kokonaisuus, vaikka `#test`-testissä nähtiin jo:

```text
2 nicks
Bob
nina
```

ja Irssi ilmoitti:

```text
Join to #test was synced
```

Se todistaa toiminnallisuutta, mutta ei vielä koko channel state -järjestelmää.

---

### 🎯 Eli jos haluat yhden tiiviin projektitilanneversion:

```text
### Jäljellä oleva ydintyö

1. Propagation

✅ NICK — toimii
🟡 JOIN — toimii, channel sync vielä kesken
🟡 PART — toimii
🟡 QUIT — toimii
🟡 NOTICE — toteutettu, S2S-testi puuttuu
✅ MESSAGE — end-to-end todistettu


2. Routing

✅ CLIENT → CLIENT — Remote → Local toimii
✅ /msg palvelinten yli — testattu
✅ Channel MESSAGE — testattu IRC-clienteillä
🟡 Oikea next-hop — ketjutesti
🟡 Ei takaisin tulosuuntaan — ketjutesti
🟡 Network/routing + S2S/routing — vastuiden selkeytys


3. Channel Sync

🟡 Channel membership
🟡 Channel creation/removal
🟡 JOIN/PART state
🟡 Channel modes
🟡 Jäsenyyden synkronointi palvelinten välillä
```

**Eli tämänhetkinen iso kuva:** MESSAGE on nyt pois varsinaisesta ongelmalistasta. **NOTICE → routing/next-hop → channel sync** on seuraava polku. 🌸


IRIS multi-server network    🎯

```text
irc.iris
   │
   ├── iris-01
   │
   ├── iris-02
   │
   └── iris-03
```

ja tavallinen Irssi voisi liittyä yhteen palvelimeen
 samalla kun toinen käyttäjä on toisella palvelimella. 🌸
