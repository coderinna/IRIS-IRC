// src/s2s/messages/server/validateServerId.js

const LIMITS = {
    SERVER_ID: 64
};

function validateServerId(serverId) {
    if (
        typeof serverId !== 'string' ||
        serverId.length === 0 ||
        serverId.length > LIMITS.SERVER_ID
    ) {
        throw new Error(
            'IRIS SERVER serverId is invalid'
        );
    }
}

module.exports = validateServerId;