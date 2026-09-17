const {
    sendMessage
} = require('../connection/messages');

module.exports = function forwardMessage(
    connection,
    message,
    target
) {
    if (!target) {
        return false;
    }

    /*
     * Direct client target
     */
    if (target.type === 'client') {
        const targetConnection =
            target.connection;

        if (!targetConnection) {
            return false;
        }

        /*
         * Never send the message back
         * through the connection it came from.
         */
        if (
            targetConnection === connection
        ) {
            return false;
        }

        if (
            targetConnection.state !==
            'connected'
        ) {
            return false;
        }

        sendMessage(
            targetConnection,
            message,
            message.messageId
        );

        console.log(
            `[IRIS] → MESSAGE ` +
            `${message.clientId} → ` +
            `${target.client.nick} ` +
            `via ${target.client.serverId}`
        );

        return true;
    }

    /*
     * Channel target
     *
     * Multiple remote clients can exist
     * on the same server. Send the MESSAGE
     * only once to that S2S connection.
     */
    if (target.type === 'channel') {
        const connections =
            new Set();

        for (
            const client
            of target.clients
        ) {
            if (!client.connection) {
                continue;
            }

            if (
                client.connection === connection
            ) {
                continue;
            }

            if (
                client.connection.state !==
                'connected'
            ) {
                continue;
            }

            connections.add(
                client.connection
            );
        }

        let forwarded = false;

        for (
            const targetConnection
            of connections
        ) {
            sendMessage(
                targetConnection,
                message,
                message.messageId
            );

            forwarded = true;

            console.log(
                `[IRIS] → MESSAGE ` +
                `${message.clientId} → ` +
                `${target.channel.name} ` +
                `via ${targetConnection.remote.serverId}`
            );
        }

        return forwarded;
    }

    return false;
};