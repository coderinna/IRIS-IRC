// src/s2s/network-manager/clients/removeClientsByConnection.js


module.exports = function removeClientsByConnection(
    manager,
    connection
) {
    for (const [key, client] of manager.clients) {
        if (client.connection !== connection) {
            continue;
        }

        // Poista asiakas kaikista verkkokanavista.
        for (const [channelName, channel] of manager.channels) {
            if (channel.clients.has(client)) {
                manager.removeClientFromChannel(
                    channelName,
                    client
                );
            }
        }

        // Poista asiakas verkkorekisteristä.
        manager.clients.delete(key);

        console.log(
            `[IRIS] Removed disconnected client ` +
            `${client.nick || '*'} ` +
            `(${client.clientId || client.id || 'unknown'})`
        );
    }
};


/*
module.exports = function removeClientsByConnection(
    manager,
    connection
) {
    for (const [key, client] of manager.clients) {
        if (client.connection === connection) {
            manager.clients.delete(key);
        }
    }
};
*/