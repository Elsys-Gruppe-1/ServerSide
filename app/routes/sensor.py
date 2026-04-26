from flask import Blueprint, render_template, jsonify, send_file
from app.db import Session, Measurements, Detections
from io import StringIO, BytesIO
import csv
from datetime import datetime

sensor_bp = Blueprint("sensor", __name__)

@sensor_bp.route("/sensor")
def sensor():
    return render_template("sensor.html", active_page="sensor")

# Til grafene
def get_data():
    with Session() as session:
        measurements = session.query(Measurements).all() #Henter målinger fra tabellen Measurements
        result = []
    
        for m in measurements:
            result.append({"pi_id":m.pi_id,
                        "sensor_name":m.sensor_name,
                        "ts":m.ts,
                        "sensor_value":m.sensor_value,
                        "depth":m.depth})
        return result #Liste med navn og tilhørende verdier

@sensor_bp.route("/api/data")
def api_data():
    return jsonify(get_data())

@sensor_bp.route("/api/detections")


#Funksjon som lager CSV-fil som kan lastes ned
def csv_download():
    with Session() as session: #Åpner en database-session
        measurements = session.query(Measurements).all() #Henter målinger fra tabellen Measurements
    
    group = {}

    for m in measurements:
        if isinstance(m.ts, (int, float)): #Gjør timestamp lesbar
            readable_ts = datetime.fromtimestamp(m.ts). strftime("%Y-%m-%d %H:%M:%S")
        else:
            readable_ts = m.ts
        
        k = (m.pi_id, readable_ts, m.depth) #Ønsker at målinger med samme pi_id, timestamp, og depth skal havne på samme rad

        if k not in group:
            group[k] = {
                "pi_id": m.pi_id,
                "timestamp": readable_ts,
                "depth": m.depth,
                "Temperatur": "", #Tom verdi somfylles når vi finner temperatur-målingen
                "TDS": "" #Tom verdi som fylles når vi finner TDS-målingen
            }
        
        if m.sensor_name == "Temperatur":
            group[k]["Temperatur"] = m.sensor_value
        elif m.sensor_name == "TDS":
            group[k]["TDS"] = m.sensor_value
    
    output = StringIO() #Midlertidig tekstfil
    writer = csv.writer(output)
    writer.writerow(["Pi-id", "Timestamp", "Dybde", "Temperatur", "TDS"]) #Første rad i CSV-filen

    for row in group.values(): #group.values gir radene fra dictionaryen group. Itererer gjennom de ferdige radene og skriver dem til CSV
        writer.writerow([
            row["pi_id"],
            row["timestamp"],
            row["depth"],
            row["Temperatur"],
            row["TDS"],
        ])
    
    memory_file = BytesIO() #Midlertidig fil for bytes istedenfor tekst.
    memory_file.write(output.getvalue().encode("utf-8")) #Henter tekst fra StringIO-fila og gjør om til bytes
    memory_file.seek(0) #Flytter pekeren fra slutten av filen til starten slik at send_file leser fra starten

    return send_file(
        memory_file, #Filen som skal lastes ned
        mimetype="text/csv", #At filen er av typen CSV
        as_attachment=True, #Nettleseren skal laste ned
        download_name="sensor_data.csv" #Filnavn
    )

@sensor_bp.route("/api/download")
def download_data():
    return csv_download()

def detections_csv():
    with Session() as session:
        detections = session.query(Detections).all() #Henter verdiene fra tabellen Detections
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Pi-id", "Fish-id", "Data", "Image path", "Timestamp"]) #Første rad i csv-filen

    for d in detections:
        writer.writerow([
            d.id, d.pi_id, d.fish_id, d.data, d.image_path, d.ts
        ])
    
    memory_file = BytesIO()
    memory_file.write(output.getvalue().encode("utf-8"))
    memory_file.seek(0)

    return send_file(
        memory_file,
        mimetype="text/csv",
        as_attachment=True,
        download_name="detections.csv"
    )


@sensor_bp.route("/download/detections")
def download_detections():
    return detections_csv()