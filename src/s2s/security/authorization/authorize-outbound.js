module.exports = function authorizeOutbound({
    serverPolicy,
    action
}) {
    if (!serverPolicy) {
        return {
            authorized: false,
            reason: 'SERVER_POLICY_MISSING'
        };
    }

    const ACTION_POLICIES = {
        introduce: 'allowServerIntroduction',
        route: 'allowRouting',
        sync: 'allowSynchronization'
    };

    const policy = ACTION_POLICIES[action];

    if (!policy) {
        return {
            authorized: false,
            reason: 'ACTION_NOT_SUPPORTED',
            action
        };
    }

    if (serverPolicy[policy] !== true) {
        return {
            authorized: false,
            reason: 'OUTBOUND_ACTION_DENIED',
            action
        };
    }

    return {
        authorized: true,
        action
    };
};
