const resolveTarget =
    require('./resolveTarget');

const forwardMessage =
    require('./forward');

module.exports = function routeMessage(
    connection,
    message,
    sourceClient
) {
    if (
        !connection.manager ||
        !connection.manager.networkManager ||
        !connection.manager.remoteClients
    ) {
        return false;
    }

    const networkManager =
        connection.manager.networkManager;

    const remoteClients =
        connection.manager.remoteClients;

    const target =
        resolveTarget(
            networkManager,
            remoteClients,
            connection.manager.getLocalClientByNick,
            message.target
        );

    if (!target) {
        return false;
    }

    return forwardMessage(
        connection,
        message,
        target,
        sourceClient
    );
};