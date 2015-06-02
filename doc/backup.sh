#!/bin/bash

# Chefcito Mongo Database Backup

# Get the container ID:
CONTAINER=`docker ps | grep mongo | grep -v amb | cut -d" " -f1`

# Create a dump on the container
docker exec $CONTAINER /usr/bin/mongodump --db=chefcito --out=/root/dump

# Copy it here
docker cp $CONTAINER:/root/dump .

# And make a nice tar
sudo tar -cjf mongo-backup.tar.bz2 dump

# Finally, clean up and give the tar a nice name.
sudo rm -rf dump
mv mongo-backup.tar.bz2 backups/mongo-backup-`date +%Y%m%d_%H%M%S`.tar.bz2
