# CDD Legrigne - Raspberry Pi Deployment Guide

This guide will help you deploy your Flask + React application on a Raspberry Pi using nginx and gunicorn.

## Prerequisites

1. Raspberry Pi with Raspbian/Debian installed
2. Python 3.7+ installed
3. nginx installed: `sudo apt update && sudo apt install nginx`
4. Your React build files in `/home/elia/build`
5. This repository code available on the Pi

## Quick Deployment

1. **Make sure your React app is built and placed in `/home/elia/build`**

2. **Run the deployment script:**

   ```bash
   sudo ./deploy.sh
   ```

3. **Access your application:**
   - Open a browser and go to `http://192.168.1.101`
   - Other devices on your LAN can access it using the same URL

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Install Dependencies

```bash
sudo apt update
sudo apt install nginx python3-venv python3-pip
```

### 2. Set up Backend

```bash
# Copy backend files to /home/elia/backend
mkdir -p /home/elia/backend
cp -r backend/* /home/elia/backend/

# Create virtual environment
cd /home/elia/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Services

```bash
# Install systemd service
sudo cp cdd-legrigne.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cdd-legrigne

# Install nginx configuration
sudo cp nginx-site.conf /etc/nginx/sites-available/cdd-legrigne
sudo ln -sf /etc/nginx/sites-available/cdd-legrigne /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### 4. Start Services

```bash
sudo systemctl start cdd-legrigne
sudo systemctl start nginx
```

## Directory Structure on Raspberry Pi

```
/home/elia/
├── build/                    # React build files (static frontend)
│   ├── index.html
│   ├── static/
│   └── ...
└── backend/                  # Flask backend
    ├── main.py
    ├── gunicorn.conf.py
    ├── requirements.txt
    ├── venv/                 # Python virtual environment
    ├── dao/
    ├── servlets/
    └── config/
```

## Useful Commands

```bash
# Check service status
sudo systemctl status cdd-legrigne
sudo systemctl status nginx

# View logs
sudo journalctl -u cdd-legrigne -f
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart cdd-legrigne
sudo systemctl restart nginx

# Test the application
curl http://192.168.1.101
```

## Troubleshooting

1. **Service won't start:**

   - Check logs: `sudo journalctl -u cdd-legrigne`
   - Verify Python environment: `ls /home/elia/backend/venv/bin/`

2. **Nginx errors:**

   - Check configuration: `sudo nginx -t`
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`

3. **Permission issues:**

   - Ensure correct ownership: `sudo chown -R elia:elia /home/elia/`

4. **Can't access from other devices:**
   - Check firewall: `sudo ufw status`
   - Verify IP address: `ip addr show`

## Network Access

- **Raspberry Pi IP:** 192.168.1.101
- **Port:** 80 (HTTP)
- **Access from LAN:** Any device on the 192.168.1.x network can access the application

## Performance Tips for Raspberry Pi

1. **Reduce gunicorn workers** if you have limited RAM:

   ```python
   # In gunicorn.conf.py
   workers = 2  # Instead of 4
   ```

2. **Enable swap** if needed:

   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=1024
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

3. **Monitor resources:**
   ```bash
   htop
   free -h
   df -h
   ```
