// src/s2s/connection/handlers/server.js

const {
    decodeServer
} = require('../../messages/server');
const authorizeServer =
    require('../../security/authorization/authorize-server');
const validateServerIdentity =
    require('../../security/validation/validate-server-identity');
const validateServerIntroduction =
    require('../../security/validation/validate-server-introduction');
const {
    STATES
} = require('../states.js');

module.exports = function handleServer(
    connection,
    frame
) {
    try {
        const server =
            decodeServer(frame.payload);
if (
    connection.state === STATES.CONNECTED
) {
    if (!connection.manager) {
        throw new Error(
            'IRIS SERVER requires manager'
        );
    }

    const introductionCheck = validateServerIntroduction({
        server,
        trustRegistry: connection.trustRegistry,
        serverPolicy: connection.serverPolicy
    });

    if (!introductionCheck.valid) {
        throw new Error(
            `IRIS SERVER introduction rejected: ${introductionCheck.reason}`
        );
    }

    const registered =
        connection.manager.registerIntroducedServer(
            connection,
            server
        );

    if (!registered) {
        throw new Error(
            `IRIS SERVER introduction rejected: ${server.serverId}`
        );
    }

    return true;
}


        const identityCheck = validateServerIdentity({
            hello: connection.remote,
            server
        });

        if (!identityCheck.valid) {
            throw new Error(
                `IRIS SERVER identity validation failed: ${identityCheck.reason}`
            );
        }

        connection.remote.serverName =
            server.serverName;

        connection.remote.serverVersion =
            server.serverVersion;

        connection.remote.serverRole =
            server.serverRole;

        connection.remote.parentServerId =
            server.parentServerId;

        connection.remote.hopCount =
            server.hopCount;

        console.log(
            `[IRIS] ← SERVER ${server.serverId} ` +
            `${server.serverName} ` +
            `(${server.serverRole})`
        );

        connection.state = STATES.READY;

        connection.sendReady();

        return true;

    } catch (error) {
        console.error(
            '[IRIS] Invalid SERVER:',
            error.message
        );

        connection.socket.destroy();

        return false;
    }
};