## ba-gestures
# Bachelor Project in Interaction Design at ZHdK

Code for tryouts, prototypes and final project

Commit


### Instructions for 3rd party tools:

#### Shiftr.io
Create a namespace and add a token at shiftr.io
https://shiftr.io/jones/gesture-control

#### Arduino and MQTT
Need to install the Arduino IDE and the library
https://github.com/256dpi/arduino-mqtt
(easiest via the library manager in the Arduino IDE)

#### WiFi
Wifi: BRIDGE
PW: ARPANet but new name, all lowercase.


## Install Setup on other Macs

Show hidden files
`defaults write com.apple.finder AppleShowAllFiles TRUE;killall Finder`

Install Homebrew
`$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

Install Node
`$ curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"`

Install bower globally
`$ sudo npm install -g bower`
`$ sudo npm install --global gulp-cli`

In the directory itself:

`$ npm install`
`$ bower install`



## Mixed

Concatenate all .txt files in the same directory:
`$ *.txt > output.txt`
