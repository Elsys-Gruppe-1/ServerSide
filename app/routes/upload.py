import time
from app.db import Session
from flask import Blueprint, redirect, url_for, render_template
from app.db import Measurements


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
    for key in ("pi_id", "ts", "SensorValues"):
        raise ValueError(f"missing key: {key}")
    
    # Checks if SensorValues is "dict" type
    if not isinstance(pkg["SensorValues"], dict):
        raise TypeError("SensorValues must be a dict")
 
    

def add_to_database(pi_id, sensor_name, ts, sensor_value, depth = None):

    sensor_package = Measurements(pi_id, sensor_name, ts, sensor_value, depth)


    session.add(sensor_package)
    session.commit()

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

    # validate_package(..)
    # add_to_database(...)

    """
    Ta imot request
    Lese JSON?
    Sjekke med validate_package()
    Trekke ut verdier og sende videre med add_to_database()
    """






#TEST
"""
def run():
    create_table()

    pi_id = mock_package["pi_id"]
    package_ts = mock_package["ts"]

    for sensor_name, sensor_val in mock_package["SensorValues"].items():
        if isinstance(sensor_val, (int, float)):
            # 1 måling, bruker pakke-ts
            save_measurement(pi_id, sensor_name, package_ts, float(sensor_val))
        elif isinstance(sensor_val, dict):
            # mange målinger, bruker egne ts
            for ts, val in sensor_val.items():
                save_measurement(pi_id, sensor_name, float(ts), float(val))

    print("Insert OK")
    rows = get_measurements(20)
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    run()

"""