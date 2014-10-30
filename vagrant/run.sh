#!/bin/bash

#Defaults
containers="mongodb elasticsearch"

if [[ "x$1" != "x" ]]; then
  containers=$1
fi

vagrant up --no-parallel --provider=docker $containers
