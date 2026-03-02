import time
from app.db import Session
from flask import Blueprint, redirect, url_for, render_template
from app.db import Measurements
from flask import request, jsonify


upload_bp = Blueprint("upload", __name__)

# MOCK DATASE SENSOR TABELL OPPSET
# raspberrypi_id   -    sensor_id   - sensor_verdi  - ts



mock_package = {
    "ts":time.time(), # Timestamp; when data is sendt
    "pi_id":1, # id (int), id til raspberrypi-en som uplaodet daten
    "SensorValues":{ # Dict[Str] -> float | (Dict[ts] -> float), dataverdier til en sensor gitt som enten float eller list
        "Temperature": 4.12,
        "Salt": {time.time()-3: 12,
                 time.time()-2: 12.2,
                 time.time()-1: 12.4,
                 time.time(): 12.5}
    }
    }

ny_mock_package = {
    'pi_id': 1, 
     'depth': 1, 
     'sensor_value': {'Tmp': -1000, 'TDS': -1.50478}, 
     'ts': '2026-02-23 11:55:43'
}

# Eksempel plan
# Finne ut av hvordan man setter opp database og kobler den til flask
# Lage en funskjon som tar inn "mock_package" og lagrer denne i databasen
# Lage et api som kan ta in pakker fra raspberry pien og lagre denne i databasen
# Lage funksjon for å ta data ut av databasen
# Lage en side hvor forskellig sensor-data blir visualisert


# Validate the input
def validate_package(pkg):
    # Checks if pkg is "dict" type
    if not isinstance(pkg, dict):
        raise TypeError("package must be a dict")
    
    # Checks if the key is in the dictionary
    for key in ("pi_id", "ts", "sensor_value"):
        if key not in pkg:
            raise ValueError(f"missing key: {key}")
    
    # Checks if SensorValues is "dict" type
    if not isinstance(pkg["sensor_value"], dict):
        raise TypeError("sensor_value must be a dict")
 
    

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
    

@upload_bp.route("/api/upload")
def upload():
    """
    Funksjon du kan nå fra api som tar inn en pakke
    """

    #lese data sendt fra raspberry pi:
    pkg = request.get_json()
    validate_package(pkg)

    #"extract" verdiene:
    pi_id = pkg["pi_id"]
    ts = pkg["ts"]
    sensor_values = pkg["SensorValues"]
    depth = pkg["depth"]

    #legger til i database basert på typen på instance
    for value in sensor_values.items():
        if isinstance(value, dict):
            for timestamp, sensor_value in value.items():
                add_to_database(pi_id, timestamp, sensor_value, depth)
        
        else:
            add_to_database(pi_id, ts, value, depth)
    
    #returnerer respons
    return {"status": "success"}

    # validate_package(..)
    # add_to_database(...)

    """
    Ta imot request
    Lese JSON?
    Sjekke med validate_package()
    Trekke ut verdier og sende videre med add_to_database()
    """


def get_data():
    with Session() as session:
        measurements = session.query(Measurements).all()
        result = []
    
        for m in measurements:
            result.append({"pi_id":m.pi_id,
                        "sensor_name":m.sensor_name,
                        "ts":m.ts,
                        "sensor_value":m.sensor_value,
                        "depth":m.depth})
        return result



#TEST
"""
def run():
    create_table()

    pi_id = mock_package["pi_id"]
    package_ts = mock_package["ts"]

    for sensor_name, sensor_val in mock_package["SensorValues"].items():
        if isinstance(sensor_val, (int, float)):
            # 1 måling, bruker pakke-ts
            add_to_database(pi_id, sensor_name, package_ts, float(sensor_val))
        elif isinstance(sensor_val, dict):
            # mange målinger, bruker egne ts
            for ts, val in sensor_val.items():
                add_to_database(pi_id, sensor_name, float(ts), float(val))

    print("Insert OK")
    rows = get_measurements(20)
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    run()

"""
# TEST

def run():
    validate_package(ny_mock_package)
    pi_id = ny_mock_package["pi_id"]
    package_ts = ny_mock_package["ts"]

    for sensor_val in ny_mock_package["sensor_value"].items():

        if isinstance(sensor_val, (int, float)):
            print("Trying to add to database", pi_id, package_ts, sensor_val)
            add_to_database(
                pi_id,
                package_ts,
                float(sensor_val)
            )

        elif isinstance(sensor_val, dict):

            for ts, val in sensor_val.items():

                add_to_database(
                    pi_id,
                    float(ts),
                    float(val)
                )

    print("Insert OK")


if __name__ == "__main__":
    run()