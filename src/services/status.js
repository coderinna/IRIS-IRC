const metrics = require('./metrics');

function getStatus(core) {
    return {
        server: core.serverName,

        clients: core.clients.size,
        channels: core.channels.size,

        metrics: metrics.getMetrics()
    };
}

module.exports = {
    getStatus
};
