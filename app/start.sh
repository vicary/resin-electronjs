#!/bin/bash

export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

mkdir -p /data/node-red/user  || true
mkdir -p /data/node-red/nodes || true

# start cups daemon
/use/sbin/cupsd

# using local electron module instead of the global electron lets you
# easily control specific version dependency between your app and electron itself.
# the syntax below starts an X istance with ONLY our electronJS fired up,
# it saves you a LOT of resources avoiding full-desktops envs

rm /tmp/.X0-lock &>/dev/null || true
startx /usr/src/app/node_modules/electron/dist/electron /usr/src/app --enable-logging
