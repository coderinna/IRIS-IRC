# IRIS-S2S-protokolla v2


**IRIS-S2S-protokolla v2** on IRIS IRC -projektia varten kehitetyn palvelinten välisen tiedonsiirtoprotokollan toinen sukupolvi.

Protocol v1 :
[IRIS-S2S Protocol v1 – PROTOCOL.md](https://github.com/coderinna/IRIS-IRC/blob/main/PROTOCOL.md?utm_source=chatgpt.com)


## Protokollan yleiskuvaus


| Ominaisuus | Arvo |
|---|---|
| Protokolla | IRIS-S2S |
| Versio | 2 |
| Tyyppi | Tapahtumapohjainen binääriprotokolla |
| Tapahtumien alkuperä | Palvelinkohtainen Server ID |
| Tapahtumien järjestys | Palvelinkohtainen Sequence |
| Tapahtumien tunnistus | Event ID |
| Tapahtumahistoria | Palvelinkohtainen tapahtumaloki |
| Kausaalinen konteksti | Causal Context |
| Tapahtumien synkronointi | History Synchronization |
| Puuttuvien tapahtumien tunnistus | Missing Event Detection |
| Tapahtumien palauttaminen | Event Recovery |
| Rinnakkaisten tapahtumien käsittely | Concurrent Event Handling |
| Tilanhallinta | Distributed State Reconstruction |
| Verkkokatkoksista palautuminen | Netsplit Recovery |
| Käyttötarkoitus | Hajautetun IRIS-verkon S2S protokolla ja sen toimintavarmuuden parantaminen säilyttämällä tapahtumahistoria ja mahdollistamalla hajautetun tilan palauttaminen verkkokatkosten jälkeen

### Arkkitehtuuri

```text
          IRIS-S2S-VERKKO v2
                  |
        +---------+---------+
        |         |         |
     IRIS-01   IRIS-02   IRIS-03
        |         |         |
   Tapahtuma- Tapahtuma- Tapahtuma-
   historia   historia   historia
        |         |         |
        +---------+---------+
                  |
       TAPAHTUMAHISTORIOIDEN
             VERTAILU
                  |
       PUUTTUVIEN TAPAHTUMIEN
             PALAUTUS
                  |
       KAUSAALISTEN SUHTEIDEN
           REKONSTRUOINTI
                  |
       HAJAUTETUN TILAN
            YHTEENSOVITUS
```
