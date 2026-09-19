// src/s2s/messages/server/serverName.js

const LIMITS = {
    SERVER_NAME: 255
};

function validateServerName(serverName) {
    if (
        typeof serverName !== 'string' ||
        serverName.length === 0 ||
        serverName.length > LIMITS.SERVER_NAME
    ) {
        throw new Error(
            'IRIS SERVER serverName is invalid'
        );
    }
}

module.exports = validateServerName;