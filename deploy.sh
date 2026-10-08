#!/bin/bash
# Builds the backend and frontend on the EC2 instance and restarts the backend.
# Usage, on the server from the repo root: git pull --ff-only && ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Building backend"
rm -rf publish/backend
dotnet publish backend/backend.csproj -c Release -o publish/backend

echo "==> Building frontend"
(cd frontend && npm ci && npm run build)

echo "==> Copying build output"
sudo rsync -a --delete --chown=root:root publish/backend/ /opt/thesetuprank/backend/
sudo rsync -a --delete --chown=root:root frontend/build/client/ /var/www/thesetuprank/

echo "==> Restarting backend"
sudo systemctl restart thesetuprank-backend
sleep 5
if ! systemctl is-active --quiet thesetuprank-backend; then
  echo "Backend failed to start:"
  sudo journalctl -u thesetuprank-backend -n 30 --no-pager
  exit 1
fi

echo "==> Deployed"
