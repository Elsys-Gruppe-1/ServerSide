from flask import Blueprint, redirect, url_for, render_template

index_bp = Blueprint("index", __name__)

@index_bp.route("/index")
def home():
    return render_template("index.html")