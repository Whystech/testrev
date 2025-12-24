#!/bin/bash

cd REVmetry-Dashboard
node server.js &
cd ..
python telemetry.py &
wait