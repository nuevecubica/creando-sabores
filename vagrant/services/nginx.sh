#!/bin/bash
cat > /etc/nginx/nginx.conf <<EOF
worker_processes 1;
events { worker_connections 1024; }

http {
  sendfile on;

  gzip              on;
  gzip_http_version 1.0;
  gzip_proxied      any;
  gzip_min_length   500;
  gzip_disable      "MSIE [1-6]\.";
  gzip_types        text/plain text/xml text/css
                    text/comma-separated-values
                    text/javascript
                    application/x-javascript
                    application/atom+xml;

  client_max_body_size 5m;

  upstream coreos-localhost { server ${NODE_PORT:6}; }
  server {
    listen      [::]:80;
    listen      80;
    server_name localhost;
    location    / {
      proxy_pass  http://coreos-localhost;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host \$http_host;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_set_header X-Forwarded-For \$remote_addr;
      proxy_set_header X-Forwarded-Port \$server_port;
      proxy_set_header X-Request-Start \$msec;
    }
  }
}
EOF
nginx -g "daemon off;"