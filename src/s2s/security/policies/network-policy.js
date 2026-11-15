const DEFAULT_NETWORK_POLICY = {
    // Verkon tunniste
    networkId: null,

    // S2S-yhteyden turvallisuus
    requireTLS: false,

// Vaaditut IRIS-S2S-ominaisuudet
    requiredCapabilities: [],

    // Mahdollinen protokollaversion vähimmäisvaatimus
    minimumProtocolVersion: null,

    // Verkon hyväksymät palvelinroolit
    allowedServerRoles: []
};

function createNetworkPolicy(options = {}) {
    return {
        ...DEFAULT_NETWORK_POLICY,
        ...options,
        requiredCapabilities: [
            ...(options.requiredCapabilities || [])
        ],
        allowedServerRoles: [
            ...(options.allowedServerRoles || [])
        ]
    };
}

module.exports = {
    DEFAULT_NETWORK_POLICY,
    createNetworkPolicy
};