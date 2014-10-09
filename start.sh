#!/bin/bash

# build
grunt

if [[ "x$NODE_ENV" == 'xdevelopment' ]]; then
  # watch
  grunt concurrent
else
  # run
  node app.js
fi