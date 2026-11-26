
'use strict';

function getChannel(channelName) {
    const channel = this.state.channels.get(channelName);

    if (!channel) {
        return null;
    }

    return {
        members: [...channel.members].sort(),
        powers: Object.fromEntries(
            [...channel.powers.entries()].sort(([a], [b]) =>
                a.localeCompare(b)
            )
        ),
        lock: structuredClone(channel.lock)
    };
}

module.exports = getChannel;
