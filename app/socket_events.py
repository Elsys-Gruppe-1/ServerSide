from flask import request
from flask_socketio import SocketIO, emit

# We create the object without the app first
socketio = SocketIO(cors_allowed_origins="*")

connected_slaves = set()

def init_socket_events():
    @socketio.on('register_slave')
    def handle_register():
        slave_id = request.sid # type:ignore
        connected_slaves.add(slave_id)
        print("Slave connected;", slave_id)
        emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        slave_id = request.sid # type:ignore
        if slave_id in connected_slaves:
            connected_slaves.remove(slave_id)
            emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    @socketio.on('request_processing')
    def handle_request(data):
        emit('process_this', data, broadcast=True)

    @socketio.on('slave_response')
    def handle_slave_response(data):
        emit('final_result', data, broadcast=True)