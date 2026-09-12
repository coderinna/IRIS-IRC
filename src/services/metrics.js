const events = require('../events');

const metrics = {
    registered: 0,
    joins: 0,
    parts: 0,
    messages: 0,
    quits: 0
};

events.on('client:registered', () => {
    metrics.registered++;
});

events.on('channel:joined', () => {
    metrics.joins++;
});

events.on('channel:parted', () => {
    metrics.parts++;
});

events.on('message:sent', () => {
    metrics.messages++;
});

events.on('client:quit', () => {
    metrics.quits++;
});

function getMetrics() {
    return {
        ...metrics
    };
}

module.exports = {
    getMetrics
};