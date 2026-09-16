module.exports = function removeConnection(
    connection,
    removedConnection
) {
    connection.connections.delete(
        removedConnection
    );
};