#!/bin/bash

set -e

# Chefcito Mongo Database Restore
# Please specify the tar.bz2 file as an argument
if [ "$#" -ne 1 ]
then
	echo "Usage: $0 <backup.tar.bz2>"
	exit
fi

# Configure the container ID before running:
CONTAINER=`docker ps | grep mongo | grep -v amb | cut -d" " -f1`

# Stream the tar to the container
cat "$1" | bunzip2 | docker exec -i $CONTAINER /usr/bin/tee /tmp/backup.tar > /dev/null

# Extract it
docker exec $CONTAINER /bin/tar -xf /tmp/backup.tar -C /tmp

# Empty DB (!!!)
docker exec $CONTAINER /usr/bin/mongo chefcito --eval "db.dropDatabase()"

# Restore it
docker exec $CONTAINER /usr/bin/mongorestore --db=chefcito /tmp/dump/chefcito

