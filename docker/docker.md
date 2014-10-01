# Docker
![Docker](http://i.imgur.com/c2rz8Gm.png)

Docker is an open platform for developers and sysadmins to build, ship, and run distributed applications, whether on laptops, data center VMs, or the cloud.

## Mac OSX

### Automatic Install
- Run `./install_osx.sh`
- Enjoy!

### Manual Install
- Add Cask repo: `brew tap caskroom/homebrew-cask`
- `brew update`
- Install Cask: `brew install brew-cask`
- Install VirtualBox: `brew cask install virtualbox`
- Install Vagrant: `brew cask install vagrant`

## Access Docker machine
+ `./ssh_docker.sh`

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