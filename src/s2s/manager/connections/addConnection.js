// src/s2s/manager/connections/addConnection.js

module.exports = function addConnection(
    manager,
    newConnection
) {
    console.log(
        '[DEBUG] ADD CONNECTION manager:',
        manager.serverId,
        'before:',
        manager.connections.size
    );

    manager.connections.add(
        newConnection
    );

    newConnection.manager = manager;

    console.log(
        '[DEBUG] ADD CONNECTION manager:',
        manager.serverId,
        'after:',
        manager.connections.size
    );

    console.log(
        '[IRIS] Connection added: ' +
        `${newConnection.remote.serverId || 'unknown'}`
    );
};