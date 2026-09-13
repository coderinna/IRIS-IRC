// node network-manager.test.js


const NetworkManager = require('../network-manager');

const network = new NetworkManager();

network.addServer({
    serverId: 'iris-02',
    serverName: 'iris-02',
    host: '127.0.0.1',
    port: 7001
});

console.log(network.getServers());