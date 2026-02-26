from flask import Blueprint, redirect, url_for, render_template

strømning_bp = Blueprint("strømning", __name__)

@strømning_bp.route("/strømning")
def strømning():
    return render_template("strømning.html")