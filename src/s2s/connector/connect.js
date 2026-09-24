// src/s2s/connector/connect.js

const net = require('net');
const { S2SConnection } = require('../connection/connection.js');

const RECONNECT_DELAY = 3000;

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
    let reconnectTimer = null;

    function connect() {
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

            manager.addConnection(
                connection
            );

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

        socket.on('close', () => {
            console.log(
                `[S2S] Connection closed to ${host}:${port}`
            );

            if (reconnectTimer) {
                return;
            }

            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                connect();
            }, RECONNECT_DELAY);
        });

        return socket;
    }

    return connect();
};