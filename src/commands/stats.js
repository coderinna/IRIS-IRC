function handleStats(
    client,
    status,
    core
) {
    const data = status.getStatus(core);

    client.send(
        `:${data.server} 212 ${client.nick} :Clients ${data.clients}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Channels ${data.channels}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Registered ${data.metrics.registered}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Joins ${data.metrics.joins}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Parts ${data.metrics.parts}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Messages ${data.metrics.messages}`
    );

    client.send(
        `:${data.server} 212 ${client.nick} :Quits ${data.metrics.quits}`
    );

    client.send(
        `:${data.server} 219 ${client.nick} STATS :End of /STATS report`
    );
}

module.exports = handleStats;
