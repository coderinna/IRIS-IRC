// src/s2s/messages/server/index.js

module.exports = {
    validateServerName:
        require('./validateServerName'),

    validateServerVersion:
        require('./validateServerVersion'),

    validateServerRole:
        require('./validateServerRole'),

    validateParentServerId:
        require('./validateParentServerId'),

    validateHopCount:
        require('./validateHopCount'),

    validateMessageId:
        require('./validateMessageId')
};