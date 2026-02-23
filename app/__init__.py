from flask import Flask
import sqlalchemy

def create_app():
    app = Flask(__name__)

    from app.routes.health import health_bp
    from app.routes.home import home_bp
    from app.routes.index import index_bp
    from app.routes.siste_passert import siste_passert_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(index_bp)
    app.register_blueprint(siste_passert_bp)

    return app

