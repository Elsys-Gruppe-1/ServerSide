from flask import Blueprint, redirect, url_for, render_template

home_bp = Blueprint("home", __name__)

@home_bp.route("/")
def home():
    return render_template("home.html", active_page="home")