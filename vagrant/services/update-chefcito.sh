#!/bin/bash

TARGET=http://127.0.0.1:4001
SSHTARGET=chefcito-prod

curl -s -L $TARGET/v2/keys/chefcito-dockerfile -XPUT --data-urlencode value@Dockerfile > /dev/null
curl -s -L $TARGET/v2/keys/chefcito-nginx -XPUT --data-urlencode value@nginx.sh > /dev/null

ssh $SSHTARGET 'bash -c "/usr/bin/etcdctl get chefcito-dockerfile | /usr/bin/docker build --no-cache -t node -"'
read -e -p "New image built successfully. Restart Node to apply changes? " -i "Y" yn
case $yn in
  [Yy]* )
    echo "Restarting Node..."
    #fleetctl restart node.service
    ssh $SSHTARGET 'bash -c "sudo systemctl restart node.service; sudo ./fix_iptables"'
    ;;
  * )
    echo "Aborted. You should restart Node manually to apply changes."
    ;;
esac