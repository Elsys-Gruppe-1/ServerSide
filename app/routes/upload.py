import time
from app.db import Session
from flask import Blueprint, redirect, url_for, render_template
from app.db import Measurements
from flask import request, jsonify


upload_bp = Blueprint("upload", __name__)

base_ts = time.time()


# Validate the input
def validate_package(pkg):
    # Sjekker om pkg er en dict
    if not isinstance(pkg, dict):
        raise TypeError("package must be a dict")
    
    # Sjekker om pi_id, ts, og sesor_value er i pkg
    for key in ("pi_id", "ts", "sensor_value"):
        if key not in pkg:
            raise ValueError(f"missing key: {key}")

    # Type sjekk
    if not isinstance(pkg["pi_id"], int):
        raise TypeError("pi_id must be int")
    
    if not isinstance(pkg["ts"], str):
        raise TypeError("ts must be string")
    
    if not isinstance(pkg["sensor_value"], dict):
        raise TypeError("sensor_value must be a dict")
    
    if "depth" in pkg and not isinstance(pkg["depth"], (int, float)):
        raise TypeError("depth must be number")
 
    return True
    

def add_to_database(pi_id, sensor_name, ts, sensor_value, depth = None):

    sensor_package = Measurements(
        pi_id=pi_id, 
        sensor_name=sensor_name,
        ts=ts, 
        sensor_value=sensor_value, 
        depth=depth)

    session = Session()

    session.add(sensor_package)
    session.commit()
    session.close()

    """
    Save values to the database
    """


    """
    Ta inn 5 argumenter
    Lage dette om til 1 measurement-objekt
    Legge til i session
    Commit session
    """
    

@upload_bp.route("/api/upload", methods=["POST"])
def upload():
    """
    Funksjon du kan nå fra api som tar inn en pakke
    """

    print("1: inne i upload")

    #lese data sendt fra raspberry pi:
    pkg = request.get_json()
    print("2: mottatt pkg", pkg)

    try:
        validate_package(pkg)
    except Exception as e:
        return {"status": "error", "message": str(e)}, 400
    print("3: Pakke validert")

    #"extract" verdiene:
    pi_id = pkg["pi_id"]
    ts = pkg["ts"]
    sensor_dict = pkg["sensor_value"]
    if "depth" in pkg:
        depth = pkg["depth"]
    else:
        depth = 0
    print("4: 'extracted' verdier")

    #legger til i database basert på typen.
    for sensor_name, sensor_value in sensor_dict.items():
        print("5: skal lagre", sensor_name, ts, sensor_value, depth)
        add_to_database(pi_id, sensor_name, ts, sensor_value, depth)

    
    #returnerer respons
    print("6: Ferdig med lagring")
    return {"status": "success"}

