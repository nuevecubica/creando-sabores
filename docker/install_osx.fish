#!/usr/local/bin/fish

# Check VirtualBox
set VBX_DIR "/Applications/VirtualBox.app/"
if test ! -d "$VBX_DIR"
  echo "VirtualBox required. Install VirtualBox: http://virtualbox.org/"
  exit 1
end

# Check Homebrew
if test -z (which brew)
  echo "Homebrew not found! Installing..."
  ruby -e "(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  echo "Follow instructions and try again!"
  exit 1
end

# Install
brew update
brew install docker
brew install boot2docker

if test -d $HOME/.boot2docker
  echo "Warning: boot2docker config directory found. Skipping init."
else
  boot2docker init
  curl "http://static.dockerfiles.io/boot2docker-v1.2.0-virtualbox-guest-additions-v4.3.14.iso" > "$HOME/.boot2docker/boot2docker.iso"
end

boot2docker stop
VBoxManage sharedfolder add "boot2docker-vm" -name home -hostpath /Users

# Setup env
set BD_URL (boot2docker up 2> /dev/null | grep -o 'tcp.*')
if test -z "$BD_URL"
  if test -z "$DOCKER_HOST"
    echo "Warning: boot2docker URL not found, you should setup DOCKER_HOST env variable by yourself."
  else
    set -U DOCKER_HOST "$DOCKER_HOST"
  end
else
  set -U DOCKER_HOST "$BD_URL"
end

# Hosts entry
set DOCKER_IP (boot2docker ip 2> /dev/null)
if test -n (cat /etc/hosts | grep 'dockerhost')
  echo "Warning: A hosts entry already exists. Check it manually to match $DOCKER_IP"
else
  echo $DOCKER_IP dockerhost | sudo tee -a /etc/hosts
end

echo "Done! Try: docker info"