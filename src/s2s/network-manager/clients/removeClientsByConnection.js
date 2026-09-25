// src/s2s/network-manager/clients/removeClientsByConnection.js

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

/*
module.exports = function removeClientsByConnection(
    manager,
    connection
) {
    for (const [key, client] of manager.clients) {
        if (client.connection !== connection) {
            continue;
        }

        for (const channel of manager.channels.values()) {
            if (!channel.clients.has(client)) {
                continue;
            }

            manager.removeClientFromChannel(
                channel.name,
                client
            );
        }

        manager.clients.delete(key);
    }
};*/