from flask import Blueprint, redirect, url_for, render_template

dybde_bp = Blueprint("dybde", __name__)

@dybde_bp.route("/dybde")
def dybde():
    return render_template("dybde.html")