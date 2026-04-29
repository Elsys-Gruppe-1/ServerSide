from flask import Blueprint, redirect, url_for, render_template

#lager blueprint for hjemmesiden
home_bp = Blueprint("home", __name__)

#oppretter home_bp som en side
@home_bp.route("/")
def home():
    return render_template("home.html", active_page="home")