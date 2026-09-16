module.exports = function addConnection(
    connection,
    newConnection
) {
    connection.connections.add(
        newConnection
    );

    console.log(
        `[IRISH] Connection added: ` +
        `${newConnection.remote.serverId || 'unknown'}`
    );
};