from flask import Blueprint, redirect, url_for, render_template

oversikt_passering_bp = Blueprint("oversikt_passering", __name__)

@oversikt_passering_bp.route("/oversikt_passering")
def oversikt_passering():
    return render_template("oversikt_passering.html")