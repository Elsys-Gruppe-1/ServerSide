import socketio
import threading

sio = socketio.Client()
result_container = {}
response_event = threading.Event()
active_units = 0

@sio.on('slave_count_update') #type: ignore
def update_count(data):
    global active_units
    active_units = data['count']
    print(f"--- Server Update: {active_units} processing units online ---")

@sio.on('final_result') #type:ignore
def on_result(data):
    result_container['data'] = data['result']
    response_event.set()

def process_image(image_data):
    if not sio.connected:
        sio.connect('http://localhost:5555')
    
    if active_units == 0:
        print("Offline: No slaves available to process image. Still trying")

    response_event.clear()
    sio.emit('request_processing', image_data)
    
    if response_event.wait(timeout=10):
        return result_container.get('data')
    return "Error: Timeout"

