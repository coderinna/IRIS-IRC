const { getCommand } = require('./index');

function createCommandRouter({
    serverName,
    core,
    status,
    registerClient,
    getOrCreateChannel,
    getChannel,
    deleteChannel,
    getClientByNick,
    removeClient
}) {
    return function routeCommand(client, parsed) {
        const {
            command,
            params,
            trailing
        } = parsed;

        const handler = getCommand(command);

        if (!handler) {
            return false;
        }

        switch (command) {
            case 'CAP':
                handler(
                    client,
                    params,
                    serverName
                );
                break;

            case 'NICK':
                handler(
                    client,
                    params[0],
                    registerClient,
                    getClientByNick
                );
                break;

            case 'USER':
                handler(
                    client,
                    params[0],
                    registerClient
                );
                break;

            case 'PING':
                handler(
                    client,
                    params,
                    trailing
                );
                break;

            case 'JOIN':
                handler(
                    client,
                    params[0] || trailing,
                    getOrCreateChannel,
                    serverName
                );
                break;

            case 'PART':
                handler(
                    client,
                    params[0],
                    trailing || '',
                    getChannel,
                    deleteChannel
                );
                break;

            case 'PRIVMSG':
                handler(
                    client,
                    params[0],
                    trailing,
                    getClientByNick,
                    getChannel
                );
                break;

            case 'NOTICE':
                handler(
                    client,
                    params[0],
                    trailing,
                    getClientByNick,
                    getChannel
                );
                break;

            case 'QUIT':
                handler(
                    client,
                    trailing || 'Quit',
                    deleteChannel,
                    removeClient
                );
                break;

case 'MODE':
    handler(
        client,
        params,
        getChannel,
        serverName
    );
    break;

case 'WHO':
    handler(
        client,
        params[0],
        getChannel,
        serverName
    );
    break;


case 'STATS':
    handler(
        client,
        status,
        core
    );
    break;

            case 'PONG':
                handler(client);
                break;

            default:
                break;
        }

        return true;
    };
}

module.exports = {
    createCommandRouter
};