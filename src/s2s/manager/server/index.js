// src/s2s/manager/servers/index.js

module.exports = {

    registerRemoteServer:
        require('./registerRemoteServer'),

    registerIntroducedServer:
        require('./registerIntroducedServer'),

    unregisterRemoteServer:
        require('./unregisterRemoteServer'),


    propagateServer:
        require('./propagateServer')

};