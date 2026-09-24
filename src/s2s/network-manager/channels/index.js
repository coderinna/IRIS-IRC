// src/s2s/network-manager/channels/index.js

const addChannel =
    require('./add-channel.js');

const removeChannel =
    require('./remove-channel.js');

const getChannel =
    require('./get-channel.js');

const getChannels =
    require('./get-channels.js');

const addClient =
    require('./add-client.js');

const removeClient =
    require('./remove-client.js');

const updateState =
    require('./update-state.js');

module.exports = {
    addChannel,
    removeChannel,
    getChannel,
    getChannels,
    addClient,
    removeClient,
    updateState
};