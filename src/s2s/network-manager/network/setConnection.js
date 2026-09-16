const getServer =
    require('./getServer');

module.exports = function setConnection(
    manager,
    serverId,
    connection
) {
    const server =
        getServer(manager, serverId);

    if (!server) {
        throw new Error(
            `Unknown server: ${serverId}`
        );
    }

    server.connection = connection;

    return server;
};