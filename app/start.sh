#!/bin/bash

export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

# @see lovell/sharp#892
export LD_PRELOAD=/usr/src/app/node_modules/sharp/vendor/lib/libz.so

# Create directories for node-red
mkdir -p /data/node-red/user  || true
mkdir -p /data/node-red/nodes || true

# Defaults to the repo flow for new devices
if [ ! -f /data/node-red/user/flows.json ]
then
  cp /usr/src/app/flows-default.json /data/node-red/user/flows.json
fi

# start cups daemon
#/use/sbin/cupsd
#systemctl enable cups && systemctl start cups

# auto detect usb printer
/usr/src/app/install_printer.py

# using local electron module instead of the global electron lets you
# easily control specific version dependency between your app and electron itself.
# the syntax below starts an X istance with ONLY our electronJS fired up,
# it saves you a LOT of resources avoiding full-desktops envs

rm /tmp/.X0-lock &>/dev/null || true

npm start
