// src/s2s/connector/connect.js

const net = require('net');
const { S2SConnection } = require('../connection/connection.js');

module.exports = function connectS2S({
    manager,
    networkManager,
    host,
    port,
    serverId,
    serverName,
    serverVersion,
    serverRole,
    capabilities,
    authToken
}) {
    console.log(
        `[S2S] Connecting to ${host}:${port}`
    );

    const socket = net.createConnection({
        host,
        port
    });

    socket.on('connect', () => {
        console.log(
            `[S2S] Connected to ${host}:${port}`
        );

        const connection = new S2SConnection(
            socket,
            {
                serverId,
                serverName,
                serverVersion,
                serverRole,
                capabilities,
                authToken,
                manager,
                networkManager
            }
        );

        manager.addConnection(connection);


connection.start();


        console.log(
            '[S2S] Outbound connection registered'
        );
    });

    socket.on('error', error => {
        console.error(
            '[S2S] Connection error:',
            error.message
        );
    });

    return socket;
};