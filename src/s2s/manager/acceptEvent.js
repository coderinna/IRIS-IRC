// src/s2s/manager/acceptEvent.js

const validateRemoteEvent =
    require('../messages/validate-event');

module.exports = function acceptEvent(
    manager,
    event
) {
    if (!validateRemoteEvent(event)) {
        return false;
    }

    if (manager.eventRegistry.has(event.eventId)) {
        return false;
    }

    manager.eventRegistry.remember(
        event.eventId
    );

    return true;
};