#!/bin/bash
# Docker image
git clone https://github.com/blag/dokku-elasticsearch-dockerfiles.git /tmp/dokku-elasticsearch-dockerfiles
docker build -q=true -t blag/elasticsearch /tmp/dokku-elasticsearch-dockerfiles
rm -rf /tmp/dokku-elasticsearch-dockerfiles
# Data directory
mkdir -p $HOME/docker_volumes/elasticsearch/data
