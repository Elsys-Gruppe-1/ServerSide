import time
from app.db_gammel import create_table, save_measurement, get_measurements

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


# Convert data to list
def data_to_list(pkg):
    pi_id = int(pkg["pi_id"])
    package_ts = float(pkg)

    measurement = []

    for sensor_name, sensor_value in pkg["SensorValues"].items():
        if isinstance(sensor_value, (int, float)):
            measurement.append((pi_id, sensor_name, package_ts, float(sensor_value)))

        elif isinstance(sensor_value, dict):
            for ts, value in sensor_value.items():
                measurement.append((pi_id, sensor_name, float(ts), float(value)))

        else:
            raise TypeError(f"Unsupported sensor value type for {sensor_name}: {type(sensor_value)}")

    return measurement   
    

def save_all(measurement):
    for (pi_id, sensor, ts, value) in measurement:
        save_measurement(pi_id, sensor, ts, value)


def run():
    create_table()

    validate_package(mock_package)
    measurement = data_to_list(mock_package)
    save_all(measurement)

    print(f"Insert OK: lagret {len(measurement)} målinger")






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