
'use strict';

function createSummary({ eventLog, serverId }) {
    const servers = [];

    for (const event of eventLog.getAll()) {
        let entry = servers.find(item =>
            item.serverId === event.serverId
        );

        if (!entry) {
            entry = {
                serverId: event.serverId,
                throughSequence: 0,
                missingSequences: []
            };

            servers.push(entry);
        }

        entry.throughSequence = Math.max(
            entry.throughSequence,
            event.sequence
        );
    }

    for (const entry of servers) {
        entry.missingSequences = eventLog.getMissingSequences(
            entry.serverId,
            entry.throughSequence
        );
    }

    return {
        type: 'SYNC_SUMMARY',
        serverId,
        servers
    };
}

module.exports = createSummary;
