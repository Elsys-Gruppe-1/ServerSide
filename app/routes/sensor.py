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
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["pi_id", "sensor_name", "ts", "sensor_value", "depth"])

    for m in measurements:
        if isinstance(m.ts, (int, float)):
            readable_ts = datetime.fromtimestamp(m.ts). strftime("%Y-%m-%d %H:%M-%S")
        else:
            readable_ts = m.ts
        writer.writerow([m.pi_id, m.sensor_name, m.readable_ts, m.sensor_value, m.depth])
    
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