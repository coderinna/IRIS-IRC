module.exports = function getClients(
    manager
) {
    return [...manager.clients.values()];
};