const resolveChannel =
    require('./resolvers/channel.js');

    const resolveLocalClient =
    require('./resolvers/local-client.js');

    const resolveRemoteClient =
    require('./resolvers/remote-client.js');

    /*
     * src/s2s/routing/resolveTarget.js
     */

module.exports = function resolveTarget(
    networkManager,
    remoteClients,
    getLocalClientByNick,
    target
) {
    if (!target) {
        return null;
    }

    /*
     * Channel target
     */
if (target.startsWith('#')) {
    return resolveChannel(
        target,
        networkManager
    );
}


    /*
     * Local client
     */
const localTarget =
    resolveLocalClient(
        target,
        getLocalClientByNick
    );

if (localTarget) {
    return localTarget;
}

    /*
     * Remote client
     */
const remoteTarget =
    resolveRemoteClient(
        target,
        remoteClients,
        networkManager
    );

if (remoteTarget) {
    return remoteTarget;
}

};