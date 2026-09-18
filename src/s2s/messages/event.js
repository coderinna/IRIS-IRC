const crypto = require('crypto');

class RemoteEvent {
    constructor({
        eventId = crypto.randomUUID(),
        type,
        serverId,
        clientId,
        payload = {}
    }) {
        this.eventId = eventId;
        this.type = type;
        this.serverId = serverId;
        this.clientId = clientId;
        this.payload = payload;
    }
}

module.exports = RemoteEvent;