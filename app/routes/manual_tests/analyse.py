from flask import Blueprint, redirect, url_for, render_template
from app.socket_events import get_active_slaves_count

analyse_bp = Blueprint("analyse", __name__)

@analyse_bp.route("/analyse")
def analyse():
    return render_template("analyse.html", slave_count = get_active_slaves_count())