
// src/s2s/routing/resolvers/local-client.js

module.exports = function resolveLocalClient(
    target,
    getLocalClientByNick
) {
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
                hasSend:
                    typeof localClient.send === 'function',
                hasSocket:
                    !!localClient.socket,
                socketDestroyed:
                    localClient.socket?.destroyed
            }
            : null
    );

    if (!localClient) {
        return null;
    }

    return {
        type: 'local-client',
        client: localClient
    };
};