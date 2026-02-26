from flask import Flask
import sqlalchemy

def create_app():
    app = Flask(__name__)

    from app.routes.health import health_bp
    from app.routes.home import home_bp
    from app.routes.index import index_bp

    from app.routes.siste_passert import siste_passert_bp
    from app.routes.oversikt_passering import oversikt_passering_bp

    from app.routes.temperatur import temperatur_bp
    from app.routes.strømning import strømning_bp
    from app.routes.totalt_oppløst import totalt_oppløst_bp
    from app.routes.dybde import dybde_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(index_bp)

    app.register_blueprint(siste_passert_bp)
    app.register_blueprint(oversikt_passering_bp)

    app.register_blueprint(temperatur_bp)
    app.register_blueprint(strømning_bp)
    app.register_blueprint(totalt_oppløst_bp)
    app.register_blueprint(dybde_bp)

    return app

