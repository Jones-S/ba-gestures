(function() {

    LEAPAPP.Shiftr = function(data) {
        // constructor
        this.name = "Shiftr";
        this.mqtt = data.mqtt_uri;
        this.client_id = data.client_id;

        var uber = this;

        this.client = mqtt.connect(this.mqtt, {
            clientId: this.client_id
        });

        this.client.on('connect', function() {
            console.log('client has connected!');

            // subscribe to radio channel if computer is controlling the radio
            if (myLeapApp.flow == RADIOFLOW) {
                uber.client.subscribe('/radio');
                console.log("radio connected");
            }
            // subscribe to radio channel if computer is controlling the radio
            if (myLeapApp.flow == LAMPFLOW) {
                uber.client.subscribe('/lamp');
            }
            // subscribe to radio channel if computer is controlling the radio
            if (myLeapApp.flow == VENTILATORFLOW) {
                uber.client.subscribe('/ventilator');
            }
            // only subscribe to sound channel, if the computer is not playing external sounds
            if (!myLeapApp.ext_sounds) {
                uber.client.subscribe('/sound');
            }
            // client.unsubscribe('/example');

        });

        this.client.on('message', function(topic, message) {
            console.log('new message:', topic, message.toString());

            // receiving radio input
            if (topic == '/radio') {
                console.log("incoming");
                switch(message.toString()) {
                    case 'play':
                        myLeapApp.radio.play();
                        myLeapApp.sounder.play('on');
                        myLeapApp.flow.radio_on = true;
                        break;
                    case 'pause':
                        myLeapApp.radio.pause();
                        myLeapApp.sounder.play('off');
                        myLeapApp.flow.radio_on = false;
                        break;
                    case 'next-track':
                        myLeapApp.sounder.play('next');
                        myLeapApp.radio.nextTrack();
                        myLeapApp.flow.radio_on = true;
                        break;
                    case 'prev-track':
                        myLeapApp.radio.previousTrack();
                        myLeapApp.sounder.play('prev');
                        myLeapApp.flow.radio_on = true;
                        break;
                    case 'vol-up':
                        myLeapApp.sounder.play('vol');
                        myLeapApp.radio.volumeUp();
                        break;
                    case 'vol-down':
                        myLeapApp.sounder.play('vol');
                        myLeapApp.radio.volumeDown();
                        break;
                    default:
                        console.log("Unknown message: ", message);

                }
            }
            else if (topic == '/lamp') {
                switch(message.toString()) {
                    case 'on':
                        myLeapApp.sounder.play('on');
                        myLeapApp.flow.lamp_on = true;
                        break;
                    case 'off':
                        myLeapApp.sounder.play('off');
                        myLeapApp.flow.lamp_on = false;
                        break;
                    default:
                        console.log("Unknown message: ", message);

                }
            }
            else if (topic == '/ventilator') {
                switch(message.toString()) {
                    case 'on':
                        myLeapApp.sounder.play('on');
                        myLeapApp.flow.ventilator_on = true;
                        break;
                    case 'off':
                        myLeapApp.sounder.play('off');
                        myLeapApp.flow.ventilator_on = false;
                        break;
                    default:
                        console.log("Unknown message: ", message);

                }
            }
            else if (topic == '/sound') {
                switch(message.toString()) {
                case 'on':
                    myLeapApp.sounder.play('on');
                    break;
                case 'off':
                    myLeapApp.sounder.play('off');
                    break;
                case 'vol':
                    myLeapApp.sounder.play('vol');
                    break;
                case 'cancel':
                    myLeapApp.sounder.play('cancel');
                    break;
                case 'ok':
                    myLeapApp.sounder.play('ok');
                    break;
                case 'next':
                    myLeapApp.sounder.play('next');
                    break;
                case 'prev':
                    myLeapApp.sounder.play('prev');
                    break;
                case 'start':
                    myLeapApp.sounder.play('start');
                    break;
                case 'exit':
                    myLeapApp.sounder.play('exit');
                    break;
                default:
                    // do nothing
                    break;

                }
            }
        });

    };

    LEAPAPP.Shiftr.prototype.publish = function(topic, message) {
        var uber = this;
        uber.client.publish(topic, message);

    };



}());
