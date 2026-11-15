/*mitä jo todennettu palvelin saa tehdä, ja yhdistää kolme sääntöä:
1. Verkon operaattorin vähimmäisvaatimukset.
2. Paikallisen palvelimen omat tiukemmat vaatimukset.
3. Etäpalvelimelle annetut oikeudet TrustRegistry-rekisterissä.*/

module.exports = function authorizeServer({
    trustRegistry,
    networkPolicy,
    serverPolicy,
    serverId,
    server
}) {
    if (!trustRegistry || !networkPolicy || !serverPolicy) {
        throw new Error(
            'S2S authorization configuration is incomplete'
        );
    }

    const trustedServer =
        trustRegistry.getServer(serverId);

    if (!trustedServer) {
        return {
            authorized: false,
            reason: 'SERVER_NOT_TRUSTED'
        };
    }

    const permissions =
        trustedServer.permissions;

    if (networkPolicy.allowedServerRoles.length > 0) {
        if (!networkPolicy.allowedServerRoles.includes(server.serverRole)) {
            return {
                authorized: false,
                reason: 'NETWORK_ROLE_NOT_ALLOWED'
            };
        }
    }

    if (serverPolicy.allowedServerRoles.length > 0) {
        if (!serverPolicy.allowedServerRoles.includes(server.serverRole)) {
            return {
                authorized: false,
                reason: 'LOCAL_ROLE_NOT_ALLOWED'
            };
        }
    }

    const requiredCapabilities = [
        ...networkPolicy.requiredCapabilities,
        ...serverPolicy.requiredCapabilities
    ];

    const remoteCapabilities =
        server.capabilities || [];

    for (const capability of requiredCapabilities) {
        if (!remoteCapabilities.includes(capability)) {
            return {
                authorized: false,
                reason: 'REQUIRED_CAPABILITY_MISSING',
                capability
            };
        }
    }

    if (
        networkPolicy.requireTLS &&
        !server.tls
    ) {
        return {
            authorized: false,
            reason: 'NETWORK_REQUIRES_TLS'
        };
    }

    if (
        serverPolicy.requireTLS &&
        !server.tls
    ) {
        return {
            authorized: false,
            reason: 'LOCAL_POLICY_REQUIRES_TLS'
        };
    }

    return {
        authorized: true,
        serverId,
        permissions: {
            ...permissions
        }
    };
};