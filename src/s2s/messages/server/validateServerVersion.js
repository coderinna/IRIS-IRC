// src/s2s/messages/server/validateServerVersion.js

const LIMITS = {
    SERVER_VERSION: 128
};

function validateServerVersion(serverVersion) {
    if (
        typeof serverVersion !== 'string' ||
        serverVersion.length === 0 ||
        serverVersion.length > LIMITS.SERVER_VERSION
    ) {
        throw new Error(
            'IRIS SERVER serverVersion is invalid'
        );
    }
}

module.exports = validateServerVersion;