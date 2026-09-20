
    /*
     * src/s2s/routing/resolveTarget.js
     */

module.exports = function resolveTarget(
    networkManager,
    remoteClients,
    getLocalClientByNick,
    target
) {
    if (!target) {
        return null;
    }

    /*
     * Channel target
     */
    if (target.startsWith('#')) {
            console.log(
        `[ROUTE] CHANNEL LOOKUP target=${target} ` +
        `channels=${networkManager.getChannels().map(channel => channel.name).join(',')}`
    );

    
        const channel =
            networkManager.getChannel(target);

        if (!channel) {
            return null;
        }

        return {
            type: 'channel',
            channel,
            clients: [...channel.clients]
        };
    }


    /*
     * Local client
     */
    const localClient =
        getLocalClientByNick
            ? getLocalClientByNick(target)
            : null;


console.log(
    '[ROUTE] local target result:',
    localClient
        ? {
            nick: localClient.nick,
            clientId: localClient.clientId,
            hasSend: typeof localClient.send === 'function',
            hasSocket: !!localClient.socket,
            socketDestroyed: localClient.socket?.destroyed
        }
        : null
);

    if (localClient) {
        return {
            type: 'local-client',
            client: localClient
        };
    }

    console.log(
    '[ROUTE] local target result:',
    localClient?.nick || null
);

    /*
     * Remote client
     */
    const remoteClient =
        remoteClients
            ? remoteClients.getByNick(target)
            : null;

    if (!remoteClient) {
        return null;
    }

    const server =
        networkManager.getServer(
            remoteClient.serverId
        );

    if (!server) {
        return null;
    }

    return {
        type: 'remote-client',
        client: remoteClient,
        server,
        connection: remoteClient.connection
    };
};