// src/s2s/network-manager/network/index.js

module.exports = {
    addServer:
        require('./addServer.js'),

    removeServer:
        require('./removeServer.js'),

    getServer:
        require('./getServer.js'),

    getServers:
        require('./getServers.js'),

    setStatus:
        require('./setStatus.js'),

    setConnection:
        require('./setConnection.js'),

    updateTopology:
        require('./updateTopology.js')
};