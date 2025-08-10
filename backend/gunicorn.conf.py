"""
Gunicorn configuration file
"""

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "/tmp/gunicorn_access.log"
errorlog = "/tmp/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = 'cdd_legrigne'

# Server mechanics
daemon = False
pidfile = '/tmp/cdd_legrigne.pid'
user = 'elia'
group = 'elia'
tmp_upload_dir = None

# SSL (if needed)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
