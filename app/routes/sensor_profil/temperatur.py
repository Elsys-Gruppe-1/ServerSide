from flask import Blueprint, redirect, url_for, render_template

temperatur_bp = Blueprint("temperatur_bp", __name__)

@temperatur_bp.route("/temperatur")
def temperatur():
    return render_template("temperatur.html")