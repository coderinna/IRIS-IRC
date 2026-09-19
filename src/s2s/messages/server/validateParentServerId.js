// src/s2s/messages/server/validateParentServerId.js

const LIMITS = {
    PARENT_SERVER_ID: 64
};

function validateParentServerId(parentServerId) {
    if (
        parentServerId === null ||
        parentServerId === undefined
    ) {
        return;
    }

    if (
        typeof parentServerId !== 'string' ||
        parentServerId.length === 0 ||
        parentServerId.length > LIMITS.PARENT_SERVER_ID
    ) {
        throw new Error(
            'IRIS SERVER parentServerId is invalid'
        );
    }
}

module.exports = validateParentServerId;