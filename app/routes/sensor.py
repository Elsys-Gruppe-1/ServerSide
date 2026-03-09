from flask import Blueprint, redirect, url_for, render_template

sensor_bp = Blueprint("sensor", __name__)

@sensor_bp.route("/sensor")
def sensor():
    return render_template("sensor.html")