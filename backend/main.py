"""
Main Flask application entry point
"""
from flask import Flask, send_from_directory
import os
from datetime import timedelta
from flask_cors import CORS

from servlets.account_servlet import account_bp
from servlets.semester_servlet import semester_bp
from servlets.home_servlet import home_bp
from servlets.activities_servlet import activities_bp
from servlets.logbook_servlet import logbook_bp
from servlets.account_servlet import account_bp

def create_app():
    """Application factory pattern"""
    app = Flask(__name__, static_folder='../frontend/public', static_url_path='/')
    app.secret_key = "superSecret"
    app.permanent_session_lifetime = timedelta(minutes=30)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    
    # Register blueprints (servlets)
    app.register_blueprint(account_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(logbook_bp)
    app.register_blueprint(semester_bp)

    # # Root route - serve React app
    # @app.route('/')
    # def serve():
    #     return send_from_directory(app.static_folder, 'index.html')
    
    # Serve static files for React app
    @app.route('/<path:path>')
    def static_proxy(path):
        """Serve static files or React app for client-side routing"""
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        # For client-side routing, serve index.html
        return send_from_directory(app.static_folder, 'index.html')
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
