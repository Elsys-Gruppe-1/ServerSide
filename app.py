from app import create_app
import app.db_gammel

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5600)
