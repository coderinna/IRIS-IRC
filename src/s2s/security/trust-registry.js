const crypto = require('crypto');

class TrustRegistry {
    constructor() {
        this.servers = new Map();
    }

    addServer({
        serverId,
        secret,
        permissions = {}
    }) {
        if (!serverId || typeof serverId !== 'string') {
            throw new Error('Invalid server ID');
        }

        if (!secret || typeof secret !== 'string') {
            throw new Error('Invalid server secret');
        }

        if (this.servers.has(serverId)) {
            throw new Error(
                `Server already trusted: ${serverId}`
            );
        }

        this.servers.set(serverId, {
            serverId,
            secret,
            permissions: {
                connect: permissions.connect ?? true,
                introduce: permissions.introduce ?? false,
                route: permissions.route ?? true,
                sync: permissions.sync ?? true
            }
        });

        return true;
    }

    removeServer(serverId) {
        return this.servers.delete(serverId);
    }

    getServer(serverId) {
        return this.servers.get(serverId) || null;
    }

    isTrusted(serverId) {
        return this.servers.has(serverId);
    }

    hasPermission(serverId, permission) {
        const server = this.getServer(serverId);

        if (!server) {
            return false;
        }

        return server.permissions[permission] === true;
    }

    verifySecret(serverId, receivedSecret) {
        const server = this.getServer(serverId);

        if (!server || typeof receivedSecret !== 'string') {
            return false;
        }

        const expected = Buffer.from(
            server.secret,
            'utf8'
        );

        const received = Buffer.from(
            receivedSecret,
            'utf8'
        );

        if (expected.length !== received.length) {
            return false;
        }

        return crypto.timingSafeEqual(
            expected,
            received
        );
    }
}

module.exports = TrustRegistry;