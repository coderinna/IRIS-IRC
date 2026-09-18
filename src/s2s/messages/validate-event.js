const EVENT_TYPES =
    require('./event-types');

function validateRemoteEvent(event) {
    if (!event) {
        return false;
    }

    if (!event.eventId) {
        return false;
    }

    if (!event.type) {
        return false;
    }

    if (!Object.values(EVENT_TYPES).includes(event.type)) {
        return false;
    }

    if (!event.serverId) {
        return false;
    }

    if (!event.clientId) {
        return false;
    }

    if (
        typeof event.payload !== 'object' ||
        event.payload === null
    ) {
        return false;
    }

    return true;
}

module.exports = validateRemoteEvent;