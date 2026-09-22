// src/s2s/routing/forward.js

const handleLocalClient =
    require('./handlers/local-client');

    const handleRemoteClient =
    require('./handlers/remote-client');

    const handleChannel =
    require('./handlers/channel.js');

module.exports = function forwardMessage(
    connection,
    message,
    target,
    sourceClient
) {
    if (!target) {
        return false;
    }

if (target.type === 'local-client') {
    return handleLocalClient(
        target,
        sourceClient,
        message
    );
}

if (target.type === 'remote-client') {
    return handleRemoteClient(
        connection,
        target,
        message
    );
}

 if (target.type === 'channel') {
    return handleChannel(
        connection,
        target,
        sourceClient,
        message
    );
}

    return false;
};