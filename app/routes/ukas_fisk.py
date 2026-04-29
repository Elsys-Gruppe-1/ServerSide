from flask import Blueprint, redirect, url_for, render_template

#oppretter blueprint + lokasjon for ukas_fisk siden

ukas_fisk_bp = Blueprint("ukas_fisk", __name__)

@ukas_fisk_bp.route("/ukas_fisk")
def ukas_fisk():
    return render_template("ukas_fisk.html", active_page="ukas_fisk")