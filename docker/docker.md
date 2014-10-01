# Stack
+ **Vagrant**
  [Vagrant](https://www.vagrantup.com/) is a tool for building complete development environments.

+ **Docker**
  [Docker](https://www.docker.com/) is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

+ **CoreOS**
  [CoreOS](https://coreos.com/) is a new Linux distribution that has been rearchitected to provide features needed to run modern infrastructure stacks.

## Install

### Mac OSX Automatic Installation
- Run `./install_osx.sh`
- Enjoy!

### Mac OSX Manual Installation
- Add Cask repo: `brew tap caskroom/homebrew-cask`
- `brew update`
- Install Cask: `brew install brew-cask`
- Install VirtualBox: `brew cask install virtualbox`
- Install Vagrant: `brew cask install vagrant`

## Run Vagrant + Docker
+ `./run.sh`

## Access Docker machine
+ `./ssh_docker.sh`

## Dockerfiles
+ Elasticsearch: `orchardup/elasticsearch`

## Useful Docker commands
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
+ Stop all running containers: `docker stop $(docker ps –a -q)`