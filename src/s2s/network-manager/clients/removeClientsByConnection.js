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