#!/usr/bin/env bash

VER="1.4.0"

git clone https://github.com/mqttjs/MQTT.js.git -b v$VER ./tmp

cd ./tmp

npm install
npm install uglifyify

browserify ./mqtt.js -s mqtt -g uglifyify > ../mqtt-$VER.js

cd ../

rm ./mqtt-latest.js
cp ./mqtt-$VER.js ./mqtt-latest.js

rm -rf ./tmp
