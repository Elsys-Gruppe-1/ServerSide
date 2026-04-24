from flask import Blueprint, redirect, url_for, render_template, request, jsonify
from app.socket_events import get_active_slaves_count
from app.utils.processor import process_image

analyse_bp = Blueprint("analyse", __name__)

@analyse_bp.route("/analyse", methods=["GET", "POST"])
def analyse():
    return render_template("analyse.html", active_page="analyse", slave_count = get_active_slaves_count(), player_id='mainPlayer', fps=30, boxes=[])


@analyse_bp.route('/upload-and-process', methods=['POST'])
def handle_upload():
    data = request.get_json()
    if not data or 'media' not in data:
        return jsonify({"error": "Ingen data mottatt"}), 400

    media_data = data['media']
    file_type = data.get('filetype', 'unknown')

    # This calls the background socket logic to talk to slaves
    print(f"Sending {file_type} to processing stations...")
    return process_image(media_data)
    