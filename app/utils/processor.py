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

def process_image(image_data):
    # Check if any slaves are registered in our server set
    active_units = len(connected_slaves)
    
    if active_units == 0:
        return "Error: No slaves available."

    response_event.clear()
    
    # Use the SERVER's socketio to emit to all slaves
    socketio.emit('process_this', image_data)
    
    # Wait for the 'slave_response' event to trigger the response_event
    success = response_event.wait(timeout=20)
    
    if success:
        return result_container.get('data')
    return "Error: Processing Timeout"