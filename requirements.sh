#!/bin/bash
#install requirements

sudo pip install pynmea2 # parse NMEA (GPS messages) - for OS
sudo apt install -y python3-serial python3-pip
python3 -m pip install pynmea2 --break-system-packages
sudo apt install gpsd # for OS and Daemon to launch at pi startup
sudo apt install gpsd-clients
sudo pip install gpsdclient --break-system-packages # actual python implementation

