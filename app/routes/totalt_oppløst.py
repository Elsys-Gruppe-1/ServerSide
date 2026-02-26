from flask import Blueprint, redirect, url_for, render_template

totalt_oppløst_bp = Blueprint("totalt_oppløst", __name__)

@totalt_oppløst_bp.route("/totalt_oppløst")
def totalt_oppløst():
    return render_template("totalt_oppløst.html")