VAGRANTFILE_API_VERSION = "2"

$update_channel = "alpha"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  ## Default ubuntu
  # config.vm.box = "hashicorp/trusty64"

  ## CoreOS cannot be used this way because it doesn't support vboxsf :-(
  # config.vm.box = "coreos-%s" % $update_channel
  # config.vm.box_version = ">= 308.0.1"
  # config.vm.box_url = "http://%s.release.core-os.net/amd64-usr/current/coreos_production_vagrant.json" % $update_channel

  ## Better performance
  config.vm.box = "phusion-open-ubuntu-14.04-amd64"
  config.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-14.04-amd64-vbox.box"

  config.vm.provider :virtualbox do |v|
    ## On VirtualBox, we don't have guest additions or a functional vboxsf
    ## in CoreOS, so tell Vagrant that so it can be smarter.
    # v.check_guest_additions = false
    # v.functional_vboxsf     = false
  end

  config.vm.provision "docker"
  config.vm.provision "shell", inline:
    "ps aux | grep 'sshd:' | awk '{print $2}' | xargs kill"

  # elasticsearch
  config.vm.network :forwarded_port, guest: 9200, host: 9200
  # mongodb
  config.vm.network :forwarded_port, guest: 27017, host: 27017
  config.vm.network :forwarded_port, guest: 28017, host: 28017
  # nodejs
  config.vm.network :forwarded_port, guest: 3000, host: 8080

  # shared floder
  config.vm.synced_folder "../", "/var/docker/chefcito", owner: "root", group: "root"
end