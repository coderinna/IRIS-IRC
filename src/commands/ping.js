function handlePing(client, params, trailing) {
    const token = trailing || params.join(' ');

    client.send(`PONG :${token}`);
}

module.exports = handlePing;