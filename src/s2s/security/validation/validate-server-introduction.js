module.exports = function validateServerIntroduction({
    server,
    trustRegistry,
    serverPolicy
}) {
    if (!server?.serverId) {
        return {
            valid: false,
            reason: 'SERVER_ID_MISSING'
        };
    }

    if (!trustRegistry) {
        return {
            valid: false,
            reason: 'TRUST_REGISTRY_MISSING'
        };
    }

    const trustedServer =
        trustRegistry.getServer(server.serverId);

    if (!trustedServer) {
        return {
            valid: false,
            reason: 'SERVER_NOT_TRUSTED'
        };
    }

    if (
        !trustRegistry.hasPermission(
            server.serverId,
            'introduce'
        )
    ) {
        return {
            valid: false,
            reason: 'INTRODUCTION_PERMISSION_DENIED'
        };
    }

    if (
        serverPolicy &&
        serverPolicy.allowServerIntroduction !== true
    ) {
        return {
            valid: false,
            reason: 'LOCAL_POLICY_DENIED'
        };
    }

    return {
        valid: true,
        serverId: server.serverId
    };
};
