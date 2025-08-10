"""
Main Flask application entry point
"""
from flask import Flask, send_from_directory
import os
from datetime import timedelta
from flask_cors import CORS

from config.check_session import check_session
from servlets.account_servlet import account_bp
from servlets.semester_servlet import semester_bp
from servlets.home_servlet import home_bp
from servlets.activities_servlet import activities_bp
from servlets.logbook_servlet import logbook_bp
from servlets.account_servlet import account_bp
from servlets.problembehavior_servlet import problembehavior_bp
from servlets.appreciations_servlet import appreciations_bp
from config.database import db_config

def create_app():
    """Application factory pattern"""
    # Remove static folder configuration since nginx will serve static files
    app = Flask(__name__)
    app.secret_key = "superSecret"
    app.permanent_session_lifetime = timedelta(minutes=30)
    
    # Update CORS for production - add your domain
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",  # For development
        "http://192.168.1.101",  # Raspberry Pi static IP
        "http://192.168.1.*"  # Allow any device in the same subnet
    ])
    
    # Register blueprints (servlets)
    app.register_blueprint(account_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(logbook_bp)
    app.register_blueprint(semester_bp)
    app.register_blueprint(problembehavior_bp)
    app.register_blueprint(appreciations_bp)

    @app.route('/ping')
    def ping():
        """Health check endpoint that returns database datetime"""
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT NOW()")
            db_time = cursor.fetchone()[0]
            cursor.close()
            connection.close()
            
            sess = check_session()
            if not sess:
                return {"status": "error", "message": "Invalid session"}, 500

            return {"status": "ok", "database_time": str(db_time), "session": sess}, 200
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
