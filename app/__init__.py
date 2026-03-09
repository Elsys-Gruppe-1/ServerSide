from flask import Flask
import sqlalchemy
from .socket_events import socketio, init_socket_events

def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024 # 64 Megabytes

    from app.routes.health import health_bp
    from app.routes.home import home_bp
    from app.routes.index import index_bp

    from app.routes.siste_passert import siste_passert_bp
    from app.routes.oversikt_passering import oversikt_passering_bp

    from app.routes.sensor import sensor_bp

    from app.routes.upload import upload_bp
    from app.routes.system_functions import system_bp

    from app.routes.manual_tests.analyse import analyse_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(index_bp)

    app.register_blueprint(siste_passert_bp)
    app.register_blueprint(oversikt_passering_bp)

    app.register_blueprint(sensor_bp)

    app.register_blueprint(upload_bp)
    app.register_blueprint(system_bp)

    app.register_blueprint(analyse_bp)

    socketio.init_app(app)  
    init_socket_events()

    return app

