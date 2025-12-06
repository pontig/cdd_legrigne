#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
REMOTE_USER="elia"
REMOTE_HOST="100.105.250.163"
REMOTE_FRONTEND_DIR="/home/elia/frontend"
REMOTE_BACKEND_DIR="/home/elia/backend"

# Parse command line arguments
BACKEND_ONLY=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --backend)
      BACKEND_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# 1. Build frontend (skip if --backend flag is used)
if [ "$BACKEND_ONLY" = false ]; then
  echo "🔨 Building frontend..."
  cd frontend
  yarn build
  cd ..
  
  # 2. Empty remote frontend directory and copy new build
  echo "🧹 Emptying remote frontend directory..."
  ssh ${REMOTE_USER}@${REMOTE_HOST} "rm -rf ${REMOTE_FRONTEND_DIR}/*"
  
  echo "📂 Copying frontend build to server..."
  scp -r frontend/build/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_FRONTEND_DIR}/
else
  echo "⏭️ Skipping frontend build (--backend flag specified)"
fi

# 3. Delete __pycache__ folders from remote backend
echo "🧹 Deleting __pycache__ folders from remote backend..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "find ${REMOTE_BACKEND_DIR} -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true"

# 4. Copy backend to server
echo "📂 Copying backend to server..."
rsync -av --exclude='__pycache__' backend/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BACKEND_DIR}/

# 5. Restart services on server
echo "🔄 Restarting server services..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "
  # Restart backend service first
  if systemctl is-active --quiet cdd-legrigne; then
    echo 'Restarting gunicorn (backend)...'
    sudo systemctl restart cdd-legrigne
  else
    echo '⚠️ Gunicorn is not running on service cdd-legrigne!'
  fi
  
  # Then restart nginx to ensure proper proxy configuration
  if systemctl is-active --quiet nginx; then
    echo 'Restarting nginx (reverse proxy)...'
    sudo systemctl restart nginx
  else
    echo '⚠️ Nginx is not running!'
  fi
"

echo "✅ Deployment complete!"

echo "🌐 Running curl to make it re-generate __pycache__ folders..."

sleep 2
curl http://${REMOTE_HOST}/api/ping

echo "✅ Update remote script finished."
