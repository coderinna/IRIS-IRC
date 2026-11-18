'use strict';

const { createEvent } = require('../../../events/eventTypes/event-types');

function createEventOperation(type, actorId, options, serverId, sequence, vector) {
    // Jokainen uusi tapahtuma saa seuraavan järjestysnumeron.
    sequence.value++;

    // Tallennetaan tieto siitä, mihin asti eri palvelimien tapahtumat
    // ovat paikallisen palvelimen tiedossa.
    const causalContext = Object.fromEntries(vector);

    // Rakennetaan uusi tapahtuma paikallisen palvelimen tiedoilla
    // ja annetuilla tapahtumakohtaisilla lisätiedoilla.
    return createEvent({
        serverId,
        sequence: sequence.value,
        type,
        actorId,
        targetId: options.targetId ?? null,
        channel: options.channel ?? null,
        data: options.data ?? {},
        causalContext
    });
}

module.exports = createEventOperation;