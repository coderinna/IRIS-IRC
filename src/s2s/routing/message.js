const resolveTarget =
    require('./resolveTarget');

const forwardMessage =
    require('./forward');

module.exports = function routeMessage(
    connection,
    message
) {
    if (
        !connection.manager ||
        !connection.manager.networkManager
    ) {
        return false;
    }

    const networkManager =
        connection.manager.networkManager;

    const target =
        resolveTarget(
            networkManager,
            message.target
        );

    if (!target) {
        return false;
    }

    return forwardMessage(
        connection,
        message,
        target
    );
};