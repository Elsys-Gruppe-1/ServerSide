from flask import Blueprint, redirect, url_for, render_template

siste_passert_bp = Blueprint("siste_passert", __name__)

@siste_passert_bp.route("/siste_passert")
def siste_passert():
    return render_template("siste_passert.html")