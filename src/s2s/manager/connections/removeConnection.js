module.exports = function removeConnection(
    manager,
    removedConnection
) {
    manager.connections.delete(
        removedConnection
    );

    if (
        removedConnection.manager === manager
    ) {
        removedConnection.manager = null;
    }
};