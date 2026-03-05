from app.socket_events import socketio, connected_slaves
import threading

# Container for results (Key: request_id or just a global for simple use)
result_container = {}
response_event = threading.Event()

def init_processor_events():
    """
    This function handles the 'final_result' coming back from the slave
    specifically for the server's internal logic.
    """
    @socketio.on('slave_response')
    def handle_internal_result(data):
        result_container['data'] = data['result']
        response_event.set()
import threading
import uuid
from app.socket_events import socketio

# Dictionary to store events and results by request_id
results = {}

def process_image(image_data):
    request_id = str(uuid.uuid4())
    
    # Create a unique event for THIS specific upload
    req_event = threading.Event()
    results[request_id] = {'event': req_event, 'data': None}

    # 1. Send to slaves
    socketio.emit('process_this', {
        'image': image_data,
        'request_id': request_id
    })

    # 2. Wait (This now allows other threads to handle 'on_slave_response')
    # If using eventlet, this sleep/wait is non-blocking to the hub
    success = req_event.wait(timeout=15)

    if success:
        outcome = results[request_id]['data']
    else:
        outcome = "Error: Timeout"

    # 3. Cleanup
    del results[request_id]
    return outcome

# This function should be called by your SocketIO listener in socket_events.py
def handle_incoming_result(data):
    request_id = data.get('request_id')
    if request_id in results:
        results[request_id]['data'] = data.get('result')
        results[request_id]['event'].set() # This wakes up the process_image function