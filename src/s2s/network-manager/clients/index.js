// src/s2s/network-manager/clients/index.js

module.exports = {
    addClient: require('./addClient.js'),
    removeClient: require('./removeClient.js'),
    getClient: require('./getClient.js'),
    getClients: require('./getClients.js'),
    updateClient:
        require('./updateClient.js'),
    removeClientsByConnection:
        require('./removeClientsByConnection.js')
};