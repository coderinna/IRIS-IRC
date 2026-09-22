function destroy(connection) {
    if (connection.socket.destroyed) {
        return;
    }

    connection.socket.destroy();
}


module.exports = 
  destroy
;