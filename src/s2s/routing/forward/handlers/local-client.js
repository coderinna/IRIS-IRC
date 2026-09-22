
// src/s2s/routing/handlers/local-client.js

module.exports = function handleLocalClient(
    target,
    sourceClient,
    message
) {
    const targetClient =
        target.client;

    if (!targetClient || !sourceClient) {
        return false;
    }

    targetClient.send(
        `:${sourceClient.nick}!${sourceClient.user}@${sourceClient.host} ` +
        `PRIVMSG ${targetClient.nick} :${message.message}`
    );

    console.log(
        `[IRIS] ← MESSAGE ` +
        `${sourceClient.nick} → ` +
        `${targetClient.nick} (local)`
    );

    return true;
};