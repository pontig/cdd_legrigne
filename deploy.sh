#!/bin/bash

# Deployment script for CDD Legrigne Flask + React app with nginx and gunicorn
# Optimized for Raspberry Pi deployment

echo "Starting deployment of CDD Legrigne application on Raspberry Pi..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run this script as root (use sudo)"
    exit 1
fi

# Variables for Raspberry Pi
APP_DIR="/home/elia"
BACKEND_DIR="$APP_DIR/backend"
BUILD_DIR="$APP_DIR/frontend"
SERVICE_NAME="cdd-legrigne"
DEV_DIR="/mnt/Shared/Elia/Documenti/Codici/cdd_legrigne"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p /var/log/gunicorn
mkdir -p /var/run/gunicorn

# Copy backend files to deployment location if they don't exist or are different
echo "Copying backend files to /home/elia/backend..."
if [ ! -d "$BACKEND_DIR" ]; then
    mkdir -p $BACKEND_DIR
fi

# # Copy backend files from development directory
# cp -r $DEV_DIR/backend/* $BACKEND_DIR/
# cp $DEV_DIR/cdd-legrigne.service $BACKEND_DIR/

# Set up Python virtual environment if it doesn't exist
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "Creating Python virtual environment..."
    cd $BACKEND_DIR
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "Virtual environment already exists, updating packages..."
    cd $BACKEND_DIR
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Set correct permissions
echo "Setting permissions..."
chown -R elia:elia $BACKEND_DIR
chown -R elia:elia /var/log/gunicorn
chown -R elia:elia /var/run/gunicorn
chown -R elia:elia $BUILD_DIR

# Install and configure systemd service
echo "Installing systemd service..."
cp $BACKEND_DIR/cdd-legrigne.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Install nginx configuration
echo "Installing nginx configuration..."
cp $BACKEND_DIR/nginx-site.conf /etc/nginx/sites-available/cdd-legrigne
ln -sf /etc/nginx/sites-available/cdd-legrigne /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
else
    echo "Nginx configuration error! Please check the configuration."
    exit 1
fi

# Start services
echo "Starting services..."
systemctl restart $SERVICE_NAME
systemctl restart nginx

# Check service status
echo "Checking service status..."
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✓ Gunicorn service is running"
else
    echo "✗ Gunicorn service failed to start"
    systemctl status $SERVICE_NAME
fi

if systemctl is-active --quiet nginx; then
    echo "✓ Nginx service is running"
else
    echo "✗ Nginx service failed to start"
    systemctl status nginx
fi

echo "Deployment completed!"
echo "Your application should be available at http://192.168.1.101"
echo ""
echo "Useful commands:"
echo "  Check gunicorn logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Check nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  Restart gunicorn: sudo systemctl restart $SERVICE_NAME"
echo "  Restart nginx: sudo systemctl restart nginx"
echo "  Check app status: curl http://192.168.1.101"
