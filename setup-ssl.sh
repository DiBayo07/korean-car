#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update
sudo apt-get install -yq nginx certbot python3-certbot-nginx

sudo tee /etc/nginx/sites-available/korean-car << 'EOF'
server {
    listen 80;
    server_name 13-63-165-49.sslip.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/korean-car /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
sudo certbot --nginx -d 13-63-165-49.sslip.io --non-interactive --agree-tos -m admin@13-63-165-49.sslip.io
