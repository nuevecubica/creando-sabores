Misc guides
===========

## Create a production clone

1. Create a CoreOS machine.
    * Either by cloning the current one, or installing it from scratch.
    * The cloud-config file is on: vagrant/services/user_data
2. Before booting it, assign it to a new cluster.
    * Change it on the user_data and re-apply it, or edit it directly at:
        > /var/lib/coreos-install/user_data
    * Changes get applied at reboot, or after issuing the following command:
        > sudo coreos-cloudinit --from-file user_data
    * Skipping this step means the new machine will join the same cluster,
      wreaking havoc with the services, unless they are on the same private
      network.
3. Make sure the IPs and device names are correct on the user_data, and
  issue ip commands to fix any discrepancies. Note that the .service files
  expect eth0 to be the device connected to both the private network
  (at 192.168.*.*), and the public network.
4. Check the DNS are working, or most services will fail.



## Apply updates

For the following commands, a ssh tunnel for the port 4001 is needed.
You can open it with:

    ssh chefcito-prod -L 4001:localhost:4001

* If updating chefcito only:

    You can use the automated script "update-chefcito.sh", which will rebuild
    the node docker image, then apply the changes with minimal downtime.

* For other services:

    To be sure that they get updated, you should destroy the existing services,
    then create the new ones. It can be done from the services folder:

        fleetctl --driver=etcd --endpoint=http://localhost:4001/ destroy *.service
        ./deploy



## Troubleshooting

* All units are failed:
    * Check internet connectivity
    * Restart Docker daemon
    * Reboot

* Mongo and Elastic run fine, but all others fail.
    * Probably failed to register their addresses, so the ambassadors die.

        The *-docker-reg images just do something equivalent to:

            etcdctl --debug set /services/mongo-a/mongo '{ "port": 49xxx, "host": "192.168.xx.xxx" }' --ttl 30

        So doing it by hand might reveal the cause.

    * If the peer address (in the curl examples) doesn't match the expected one,
      etcd might be announcing the wrong IP. Check user_data, and cluster status.

* Node complains it can't connect to Mongo/Elastic. Nginx can't connect to Node.

    Check the IP and ports published on etcd:

        etcdctl ls /services
        etcdctl get /services/mongo-A/mongo
        etcdctl get /services/elastic-A/elasticsearch
        etcdctl get /services/node-A/node




## Backups

Next to this file there are automated scripts to create database backups and
restore them. Be careful that the restore script will clear the database
without asking!



## Misc
* Docker containers / infrastructure map: fleet-3-after.png
    * Black arrows: MachineOf dependencies
    * Gray arrows: not implementable MachineOf dependencies (-> interlock)
    * Red arrows: artificial MachineOf dependencies to replace the gray ones
    * Green arrows: After dependencies (not all might be needed)
