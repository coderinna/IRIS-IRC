'use strict';

const addEvent = require('./operations/addEvent.js');
const getByServer = require('./operations/getByServer.js');
const getByServerSequences = require('./operations/getByServerSequences.js');
const getMissingSequences = require('./operations/getMissingSequences.js');

class EventLog {
    constructor() {
        // Kaikki tapahtumat tallennetaan tapahtumatunnuksen perusteella.
        this.events = new Map();

        // Täällä tapahtumat löytyvät palvelimen ja järjestysnumeron perusteella.
        this.sequences = new Map();
    }

    // Lisää uuden tapahtuman lokiin ja huolehtii samalla sen järjestysnumerosta.
    add(event) {
        return addEvent(event, this.events, this.sequences);
    }

    // Hakee yhden tapahtuman tunnuksen perusteella.
    // Palautetaan kopio, jotta alkuperäistä lokiin tallennettua tapahtumaa ei voi muuttaa vahingossa.
    get(eventId) {
        const event = this.events.get(eventId);
        return event ? structuredClone(event) : null;
    }

    // Tarkistaa, löytyykö tapahtuma lokista.
    has(eventId) {
        return this.events.has(eventId);
    }

    // Hakee kaikki tietyn palvelimen tapahtumat järjestysnumeron mukaan.
    getByServer(serverId) {
        return getByServer(serverId, this.sequences, eventId => this.get(eventId));
    }

    // Hakee palvelimen tapahtumat annettujen järjestysnumeroiden perusteella.
    getByServerSequences(serverId, sequences) {
        return getByServerSequences(
            serverId,
            sequences,
            this.sequences,
            eventId => this.get(eventId)
        );
    }

    // Selvittää, mitkä palvelimen tapahtumien järjestysnumerot puuttuvat
    // tiettyyn järjestysnumeroon asti.
    getMissingSequences(serverId, throughSequence) {
        return getMissingSequences(
            serverId,
            throughSequence,
            this.sequences
        );
    }

    // Palauttaa kopiot kaikista lokiin tallennetuista tapahtumista.
    getAll() {
        return [...this.events.values()].map(event =>
            structuredClone(event)
        );
    }

    // Kertoo, kuinka monta tapahtumaa lokissa tällä hetkellä on.
    get size() {
        return this.events.size;
    }
}

module.exports = EventLog;