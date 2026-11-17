'use strict';

const EVENT_TYPES = require('./eventTypes.js');
const validateCausalContext = require('./helpers/validateCausalContext.js');

// Luo uuden IRIS-protokollatapahtuman ja varmistaa,
// että tapahtuman perustiedot ovat kelvollisia.
function createEvent({
    serverId,
    sequence,
    type,
    actorId,
    targetId = null,
    channel = null,
    data = {},
    causalContext = {}
}) {
    // Jokaisella tapahtumalla täytyy olla palvelin, joka sen loi.
    if (typeof serverId !== 'string' || !serverId) {
        throw new Error('Invalid serverId');
    }

    // Palvelimen tapahtumilla on kasvava järjestysnumero,
    // jonka avulla tapahtumat voidaan tunnistaa ja järjestää.
    if (!Number.isSafeInteger(sequence) || sequence < 1) {
        throw new Error('Invalid sequence');
    }

    // Tapahtuman tyypin täytyy olla yksi IRIS-protokollan tuntemista tyypeistä.
    if (!Object.values(EVENT_TYPES).includes(type)) {
        throw new Error('Invalid event type');
    }

    // Actor kertoo, mikä asiakas tai toimija aiheutti tapahtuman.
    if (typeof actorId !== 'string' || !actorId) {
        throw new Error('Invalid actorId');
    }

    // Tarkistetaan, että tapahtuman causal context on yhteensopiva
    // tämän palvelimen ja tapahtuman järjestysnumeron kanssa.
    validateCausalContext(causalContext, serverId, sequence);

    // Rakennetaan valmis tapahtuma.
    // Tapahtuma jäädytetään, jotta sitä ei voida myöhemmin muuttaa vahingossa.
    return Object.freeze({
        // Palvelimen tunnus ja järjestysnumero muodostavat tapahtuman yksilöllisen tunnisteen.
        eventId: `${serverId}:${sequence}`,

        serverId,
        sequence,
        type,
        actorId,

        // Kohde ja kanava ovat tapahtumatyypistä riippuvaisia lisätietoja.
        targetId,
        channel,

        // Data kopioidaan, jotta alkuperäistä oliota ei voida muuttaa tapahtuman ulkopuolelta.
        data: structuredClone(data),

        // Causal context kertoo, minkä aiempien tapahtumien jälkeen tämä tapahtuma syntyi.
        causalContext: Object.freeze({ ...causalContext })
    });
}

module.exports = {
    EVENT_TYPES,
    createEvent
};