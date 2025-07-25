"""
Main Flask application entry point
"""
from flask import Flask, send_from_directory
import os
from flask_cors import CORS

from servlets.home_servlet import home_bp
from servlets.activities_servlet import activities_bp
from servlets.logbook_servlet import logbook_bp

def create_app():
    """Application factory pattern"""
    app = Flask(__name__, static_folder='../frontend/public', static_url_path='/')
    CORS(app)
    
    # Register blueprints (servlets)
    app.register_blueprint(home_bp)
    app.register_blueprint(activities_bp)
    app.register_blueprint(logbook_bp)
    
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
