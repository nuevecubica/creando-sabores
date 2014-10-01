#!/bin/bash

# Variables
ES_DATA_DIR="$HOME/docker_volumes/elasticsearch/data"
ES_DATA_VOLUME="/data/elasticsearch/shared"
ES_IMAGE="blag/elasticsearch"
ES_NAME="elasticsearch"

# Check image
ES_IMAGE_ID=$(docker images | grep "$ES_IMAGE" | awk '{ print $3 }')
if [[ -z $ES_IMAGE_ID ]]; then
    echo "Elasticsearch image not found... Did you run 'install.sh' ?"
    exit 1
fi
echo -n "Found image $ES_IMAGE database. Checking status... "

# Check container
ES_CONTAINER_ID=$(docker ps | grep "$ES_IMAGE" | awk '{ print $1 }')
if [[ -n $ES_CONTAINER_ID ]]; then
  echo "ok."
else
  echo "stopped."

  ES_CONTAINER_ID=$(docker ps -a | grep "$ES_IMAGE" | awk '{ print $1 }')
  if [[ -n $ES_CONTAINER_ID ]]; then
    docker rm $ES_NAME > /dev/null
  fi

  echo "COMMAND: docker run -v $ES_DATA_DIR:$ES_DATA_VOLUME -d --name $ES_NAME $ES_IMAGE /run.sh"
  echo -n "Launching $ES_IMAGE... "
  # Run
  ID=$(docker run -v $ES_DATA_DIR:$ES_DATA_VOLUME -d --name $ES_NAME $ES_IMAGE /run.sh)
  sleep 1
  echo "ok."
fi
