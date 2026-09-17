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

    /*
     * Target löytyi ja MESSAGE on validi.
     *
     * forwardMessage() voi palauttaa false,
     * jos viestiä ei tarvitse lähettää takaisin
     * samaa yhteyttä pitkin.
     *
     * Se ei tarkoita routing-virhettä.
     */
    forwardMessage(
        connection,
        message,
        target
    );

    return true;
};