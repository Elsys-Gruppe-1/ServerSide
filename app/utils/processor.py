from app.extensions import socketio
import threading
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import jsonify
#from app.socket_events import add_raw_process_id, pop_raw_process_id
import time
import os
import base64
from app.db import Session, Detections, IMAGE_DIR

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

    return {
        "status": "Files uploaded, waiting for processing...",
        "request_id": request_id
    }

def add_raw_process_id(request_id, data):
    results[request_id] = data

    
def pop_raw_process_id(request_id):
    return results.pop(request_id, None)

def raw_processing_result(data):
    request_id = data.get('request_id')
    processed_data = data.get('data')

        # If this request is still waiting, give it the data and wake it up
    if request_id in results:
        results[request_id]['data'] = processed_data
        results[request_id]['event'].set()

        original_image = results[request_id].get('original_image')
        pi_id = results[request_id].get('pi_id', 0) # Fallback to 0 if not provided
        fish_id = results[request_id].get('fish_id', 0) # Fallback to 0 if not provided

        if processed_data and original_image:
            save_detection_to_db(pi_id, processed_data, original_image, fish_id)
            
def process_image_raw(image_data, pi_id, fish_id): 
    request_id = str(uuid.uuid4())
    req_event = threading.Event()
    

    add_raw_process_id(request_id, {
        'event': req_event, 
        'data': None,
        'original_image': image_data,
        'pi_id': pi_id,
        'fish_id': fish_id
    })
    # 2. Send to slaves
    socketio.emit('process_this_raw', {
        'image': image_data,
        'request_id': request_id
    })

    # 3. Block this HTTP thread until the slave responds (or 30 seconds pass)
    event_is_set = req_event.wait(timeout=30.0)
    
    if not event_is_set:
        # Worker took too long or crashed. Clean up and return 504.
        pop_raw_process_id(request_id)
        return jsonify({"error": "Worker processing timed out"}), 504

    # 4. The worker responded! Grab the data and clean up the dictionary
    processed_result = pop_raw_process_id(request_id)
    
    if processed_result['data'] is None:
         return jsonify({"error": "Worker failed to process image"}), 500
         
    # 5. Return the final data back to your simple HTTP client
    return jsonify({"status": "success", "data": processed_result['data']}), 200

# This function should be called by your SocketIO listener in socket_events.py
def handle_incoming_result(data):
    print("Received result from slave:", data)
    request_id = data.get('request_id')
    emit('data', data, to=request_id) # This sends it back to the specific waiting thread
    if request_id in results:
        results[request_id]['data'] = data.get('result')
        results[request_id]['event'].set() # This wakes up the process_image function


def save_detection_to_db(pi_id, prediction_data, image_data, fish_id):
    """Helper function to handle file saving and DB insertion"""
    
    # 1. Save the image to the disk
    # Assuming image_data is base64 encoded from the initial HTTP request
    timestamp = str(int(time.time()))
    filename = f"detection_pi_{pi_id}_{timestamp}.jpg"
    filepath = os.path.join(IMAGE_DIR, filename)
    
    try:
        # If your image data includes the "data:image/jpeg;base64," prefix, strip it
        if "," in image_data:
            image_data = image_data.split(",")[1]
            
        with open(filepath, "wb") as fh:
            fh.write(base64.b64decode(image_data))
            
    except Exception as e:
        print(f"Failed to save image to disk: {e}")
        return # Abort DB save if image save fails

    # 2. Save the record to the database
    db_session = Session()
    try:
        new_detection = Detections(
            pi_id=pi_id,
            fish_id=fish_id,
            data=prediction_data, # Dumps the dict right into the JSON column
            image_path=filepath,
            ts=timestamp
        )
        db_session.add(new_detection)
        db_session.commit()
        print(f"Saved detection {new_detection.id} to database.")
    except Exception as e:
        db_session.rollback()
        print(f"Database insertion failed: {e}")
    finally:
        db_session.close()