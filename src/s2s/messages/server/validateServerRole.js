// src/s2s/messages/server/validateServerRole.js

const ROLES = {
    HUB: 'hub',
    LEAF: 'leaf'
};

function validateServerRole(serverRole) {
    if (
        serverRole !== ROLES.HUB &&
        serverRole !== ROLES.LEAF
    ) {
        throw new Error(
            'IRIS SERVER serverRole is invalid'
        );
    }
}

module.exports = validateServerRole;