from flask import Blueprint, redirect, url_for, render_template, jsonify
from .upload import get_data

sensor_bp = Blueprint("sensor", __name__)

@sensor_bp.route("/sensor")
def sensor():
    return render_template("sensor.html")

@sensor_bp.route("/api/data")
def api_data():
    return jsonify(get_data())