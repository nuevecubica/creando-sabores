#!/bin/bash
vagrant ssh $(vagrant global-status | grep 'default' | awk '{print $1}')