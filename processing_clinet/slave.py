import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("Slave Connected. Identifying as worker...")
    sio.emit('register_slave')

@sio.on('process_this') #type: ignore
def on_process(data):
    # Simulated work
    result = f"Worker {sio.get_sid()[:5]} processed data" # type: ignore
    sio.emit('slave_response', {'result': result})

if __name__ == '__main__':
    sio.connect('http://localhost:5600')
    sio.wait()