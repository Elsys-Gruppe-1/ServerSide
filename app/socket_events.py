from flask import request
from flask_socketio import emit
from app.extensions import socketio
from .utils.processor import handle_incoming_result, save_detection_to_db
from flask_socketio import join_room

connected_slaves = set()
results = {}

def get_active_slaves_count():
    """Returns the current number of connected processing units."""
    return len(connected_slaves)

def add_raw_process_id(request_id, data):
    results[request_id] = data

    
def pop_raw_process_id(request_id):
    return results.pop(request_id, None)
    
def init_socket_events():
    @socketio.on('register_slave')
    def handle_register():
        connected_slaves.add(request.sid) #type: ignore
        emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        if request.sid in connected_slaves: #type: ignore
            connected_slaves.remove(request.sid) #type: ignore
            emit('slave_count_update', {'count': len(connected_slaves)}, broadcast=True)

    @socketio.on('slave_response')
    def handle_slave_response(data):
        handle_incoming_result(data) # This updates the internal event logic for waiting threads
        # This sends it back to the browser dashboard
        emit('final_result', data, broadcast=True)
        # And we use the event logic in the background (handled in step 1)

    @socketio.on('raw_processing_complete')
    def handle_raw_result(data):
        request_id = data.get('request_id')
        processed_data = data.get('data')

        # If this request is still waiting, give it the data and wake it up
        if request_id in results:
            results[request_id]['data'] = processed_data
            results[request_id]['event'].set()

            original_image = results[request_id].get('original_image')
            pi_id = results[request_id].get('pi_id', 0) # Fallback to 0 if not provided
            
            if processed_data and original_image:
                save_detection_to_db(pi_id, processed_data, original_image)

    @socketio.on('join')
    def on_join(data):
        # This works because it is a Socket.IO event
        user_sid = request.sid #type: ignore
        print(data)
        room = data['room']
        join_room(room)
        print(f"Client {user_sid} joined room {room}")