module.exports = function addConnection(
    manager,
    newConnection
) {
    manager.connections.add(
        newConnection
    );

    newConnection.manager = manager;

    console.log(
        `[IRISH] Connection added: ` +
        `${newConnection.remote.serverId || 'unknown'}`
    );
};