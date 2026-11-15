module.exports = function authenticateServer(
    trustRegistry,
    serverId,
    receivedSecret
) {
    if (!trustRegistry) {
        throw new Error(
            'Trust registry is not configured'
        );
    }

    const trustedServer =
        trustRegistry.getServer(serverId);

    if (!trustedServer) {
        return {
            authenticated: false,
            reason: 'SERVER_NOT_TRUSTED'
        };
    }

    if (
        !trustRegistry.hasPermission(
            serverId,
            'connect'
        )
    ) {
        return {
            authenticated: false,
            reason: 'CONNECTION_NOT_ALLOWED'
        };
    }

    const valid =
        trustRegistry.verifySecret(
            serverId,
            receivedSecret
        );

    if (!valid) {
        return {
            authenticated: false,
            reason: 'INVALID_CREDENTIALS'
        };
    }

    return {
        authenticated: true,
        serverId
    };
};