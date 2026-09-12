function handleCap(client, params) {
    const subcommand = (params[0] || '').toUpperCase();

    if (subcommand === 'LS') {
        client.send(':irc.iris.local CAP * LS :');
    }

    if (subcommand === 'END') {
        // Capability negotiation finished.
    }
}

module.exports = handleCap;