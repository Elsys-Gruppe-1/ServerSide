from flask import Blueprint, render_template, jsonify, send_file
from app.db import Session, Measurements
from io import StringIO, BytesIO
import csv
from datetime import datetime

sensor_bp = Blueprint("sensor", __name__)

@sensor_bp.route("/sensor")
def sensor():
    return render_template("sensor.html")

# Til grafene
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

@sensor_bp.route("/api/data")
def api_data():
    return jsonify(get_data())


def csv_download():
    with Session() as session:
        measurements = session.query(Measurements).all()
    
    group = {}

    for m in measurements:
        if isinstance(m.ts, (int, float)):
            readable_ts = datetime.fromtimestamp(m.ts). strftime("%Y-%m-%d %H:%M-%S")
        else:
            readable_ts = m.ts
        
        k = (m.pi_id, readable_ts)

        if k not in group:
            group[k] = {
                "pi_id": m.pi_id,
                "timestamp": readable_ts,
                "Temperatur": "",
                "TDS": "",
                "Depth": m.depth
            }
        
        if m.sensor_name == "Temperatur":
            group[k]["Temperatur"] = m.sensor_value
        elif m.sensor_name == "TDS":
            group[k]["TDS"] = m.sensor_value
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["pi_id", "timestamp", "Temperatur", "TDS", "depth"])

    for row in group.values():
        writer.writerow([
            row["pi_id"],
            row["timestamp"],
            row["Temperatur"],
            row["TDS"],
            row["depth"]
        ])
    
    memory_file = BytesIO()
    memory_file.write(output.getvalue().encode("utf-8"))
    memory_file.seek(0)

    return send_file(
        memory_file,
        mimetype="text/csv",
        as_attachment=True,
        download_name="sensor_data.csv"
    )

@sensor_bp.route("/api/download")
def download_data():
    return csv_download()