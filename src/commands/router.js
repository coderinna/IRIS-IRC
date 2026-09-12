const { getCommand } = require('./index');

function createCommandRouter({
    serverName,
    clients,
    channels,
    registerClient,
    getOrCreateChannel
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
                    clients,
                    registerClient,
                    serverName
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
                    channels,
                    serverName
                );
                break;

            case 'PRIVMSG':
                handler(
                    client,
                    params[0],
                    trailing,
                    clients,
                    channels,
                    serverName
                );
                break;

            case 'NOTICE':
    handler(
        client,
        params[0],
        trailing,
        clients,
        channels,
        serverName
    );
    break;
            case 'QUIT':
                handler(
                    client,
                    trailing || 'Quit',
                    clients,
                    channels
                );
                break;

            case 'MODE':
                handler(
                    client,
                    params,
                    channels,
                    serverName
                );
                break;

            case 'WHO':
                handler(
                    client,
                    params[0],
                    channels,
                    serverName
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
