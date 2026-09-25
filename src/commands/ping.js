// src/commands/ping.js

function handlePing(
    client,
    params,
    trailing
) {
    const token =
        trailing ||
        params.join(' ');

    console.log(
        `[IRC] PING client=${client.nick || '*'} token=${token}`
    );

    client.send(
        `PONG :${token}`
    );
}

module.exports = handlePing;