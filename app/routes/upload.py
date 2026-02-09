import time

# MOCK DATASE SENSOR TABELL OPPSET
# raspberrypi_id   -    sensor_id   - sensor_verdi  - ts





mock_package = {
    "ts":time.time(), # Timestamp; when data is sendt
    "id":1, # id (int), id til raspberrypi-en som uplaodet daten
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