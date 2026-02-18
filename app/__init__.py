from flask import Flask
import sqlalchemy

def create_app():
    app = Flask(__name__)

    from app.routes.health import health_bp
    from app.routes.home import home_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(home_bp)

    return app

