#!/bin/bash

TARGET=http://10.17.8.102:4001

curl -s -L $TARGET/v2/keys/chefcito-dockerfile -XPUT --data-urlencode value@Dockerfile > /dev/null

#fleetctl --endpoint $TARGET start *.service

fleetctl --endpoint $TARGET start mongo.service
fleetctl --endpoint $TARGET start etcd-amb-mongo.service
fleetctl --endpoint $TARGET start mongo-docker-reg.service

fleetctl --endpoint $TARGET start elastic.service
fleetctl --endpoint $TARGET start etcd-amb-elastic.service
fleetctl --endpoint $TARGET start elastic-docker-reg.service

fleetctl --endpoint $TARGET start etcd-amb-mongo-consumer.service
fleetctl --endpoint $TARGET start mongo-dyn-amb.service
fleetctl --endpoint $TARGET start etcd-amb-elastic-consumer.service
fleetctl --endpoint $TARGET start elastic-dyn-amb.service
fleetctl --endpoint $TARGET start node.service
fleetctl --endpoint $TARGET start etcd-amb-node.service
fleetctl --endpoint $TARGET start node-docker-reg.service

fleetctl --endpoint $TARGET start etcd-amb-node-consumer.service
fleetctl --endpoint $TARGET start node-dyn-amb.service
fleetctl --endpoint $TARGET start nginx.service