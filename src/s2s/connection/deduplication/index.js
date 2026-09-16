const isDuplicate = (
    connection,
    messageId
) => {
    const id =
        messageId.toString('hex');

    if (connection.messageIds.has(id)) {
        console.log(
            `[IRISH] Duplicate message ignored: ${id}`
        );

        return true;
    }

    connection.messageIds.add(id);

    if (
        connection.messageIds.size >
        connection.maxMessageIds
    ) {
        const oldestMessageId =
            connection.messageIds.values().next().value;

        connection.messageIds.delete(
            oldestMessageId
        );
    }

    return false;
};

module.exports = {
    isDuplicate
};