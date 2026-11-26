'use strict';

function getOrderedEvents(eventsMap, happensBefore, compareEvents) {
    const events = [...eventsMap.values()];
    const outgoing = new Map();
    const incoming = new Map();

    for (const event of events) {
        outgoing.set(event.eventId, []);
        incoming.set(event.eventId, 0);
    }

    for (const a of events) {
        for (const b of events) {
            if (
                a.eventId === b.eventId ||
                !happensBefore(a, b)
            ) {
                continue;
            }

            outgoing.get(a.eventId).push(b.eventId);
            incoming.set(
                b.eventId,
                incoming.get(b.eventId) + 1
            );
        }
    }

    const byId = new Map(
        events.map(event => [event.eventId, event])
    );

    const ready = events
        .filter(event => incoming.get(event.eventId) === 0)
        .sort(compareEvents);

    const ordered = [];

    while (ready.length > 0) {
        const event = ready.shift();
        ordered.push(event);

        for (const nextId of outgoing.get(event.eventId)) {
            const count = incoming.get(nextId) - 1;
            incoming.set(nextId, count);

            if (count === 0) {
                ready.push(byId.get(nextId));
                ready.sort(compareEvents);
            }
        }
    }

    if (ordered.length !== events.length) {
        throw new Error('Causal dependency cycle detected');
    }

    return ordered.map(event => structuredClone(event));
}

module.exports = getOrderedEvents;