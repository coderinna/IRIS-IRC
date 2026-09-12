function handleUser(client, username, registerClient) {
    if (!username) {
        return;
    }

    client.user = username;

    registerClient(client);
}

module.exports = handleUser;