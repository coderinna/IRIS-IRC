const events = require('../events');

events.on('client:registered', ({ client }) => {
    console.log(
        `[EVENT] client:registered ${client.nick}`
    );
});

events.on('client:nick_changed', ({ oldNick, newNick }) => {
    console.log(
        `[EVENT] client:nick_changed ${oldNick} -> ${newNick}`
    );
});

events.on('channel:joined', ({ client, channel }) => {
    console.log(
        `[EVENT] channel:joined ${client.nick} -> ${channel.name}`
    );
});

events.on('channel:parted', ({ client, channel, reason }) => {
    console.log(
        `[EVENT] channel:parted ${client.nick} <- ${channel.name}` +
        (reason ? ` (${reason})` : '')
    );
});

events.on('message:sent', ({ client, target, type }) => {
    console.log(
        `[EVENT] message:sent ${client.nick} -> ` +
        `${typeof target === 'string' ? target : target.nick} ` +
        `(${type})`
    );
});

events.on('client:quit', ({ client, reason }) => {
    console.log(
        `[EVENT] client:quit ${client.nick} (${reason})`
    );
});

events.on('client:unregistered', ({ client }) => {
    console.log(
        `[EVENT] client:unregistered ${client.nick || client.id}`
    );
});