# Docker
![Docker](http://i.imgur.com/c2rz8Gm.png)

Docker is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

## Mac OSX

### Automatic Install
- Install Virtualbox: [http://virtualbox.org/](http://virtualbox.org/)
- Run `./install_osx.sh`
- Enjoy!

### Manual Install
- Install Virtualbox: [http://virtualbox.org/](http://virtualbox.org/)
- Update brew: `brew update`
- Install docker: `brew install docker`
- Install boot2docker: `brew install boot2docker`
- Init boot2docker: `boot2docker init`
- Custom build replacement with VBx guest additions: `curl "http://static.dockerfiles.io/boot2docker-v1.2.0-virtualbox-guest-additions-v4.3.14.iso" > "$HOME/.boot2docker/boot2docker.iso"`
- Allow to mount directories from the host into containers: `VBoxManage sharedfolder add "boot2docker-vm" -name home -hostpath /Users`

#### Boot up
_You must copy the `tcp://...` URL that this command will output._
`boot2docker up`

#### Setup the _DOCKER_HOST_ environment variable
_Replace `URL` with the URL from the last command._

+ Fish: `set -x DOCKER_HOST URL`
+ Bash: `export DOCKER_HOST=URL`

#### Setup a host entry
+ Fish: `echo (boot2docker ip 2> /dev/null) dockerhost | sudo tee -a /etc/hosts`
+ Bash: `echo $(boot2docker ip 2> /dev/null) dockerhost | sudo tee -a /etc/hosts`

### Test it
`docker info`

### Useful commands (_fish_ format)
+ Help: `docker help`
+ List running containers: `docker ps`
+ List all containers: `docker ps -a`
+ List local images: `docker images`
+ Download an image from the docker repository: `docker pull [image name]`
+ Start a container: `docker run -d -P --name [container name] [image name]`
+ Stop a container: `docker stop [container name | container id]`
+ Kill a container: `docker kill [container name | container id]`
+ Remove a container: `docker rm [container name | container id]`
+ Forward a container port outside: `docker port [container name] [internal port]`
+ Start and mount a host directory: `docker run -d -P -v [host path]:[container path] --name [container name] [image name]`
+ Save local container changes to an image: `docker commit [container id] [image name]`
+ Stop all running containers: `docker stop (docker ps –a -q)`