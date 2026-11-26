'use strict';

function updateVector(events, receivedSequences, serverId, sequence, vector) {
    for (const event of events) {
        let received = receivedSequences.get(event.serverId);

        if (!received) {
            received = new Set();
            receivedSequences.set(event.serverId, received);
        }

        received.add(event.sequence);

        // Pidetään paikallinen tapahtumalaskuri ajan tasalla myös
        // silloin, kun lokiin lisätään oman palvelimen aiempia tapahtumia.
        if (
            event.serverId === serverId &&
            event.sequence > sequence.value
        ) {
            sequence.value = event.sequence;
        }

        // Vektoria kasvatetaan vain niin kauan kuin tapahtumien
        // järjestysnumeroissa ei ole aukkoja.
        let current = vector.get(event.serverId) || 0;

        while (received.has(current + 1)) {
            current++;
        }

        vector.set(event.serverId, current);
    }
}

module.exports = updateVector;