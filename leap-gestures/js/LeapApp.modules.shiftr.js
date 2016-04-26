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

            uber.client.subscribe('/radio');
            // client.unsubscribe('/example');

        });

        this.client.on('message', function(topic, message) {
            console.log('new message:', topic, message.toString());

            // receiving radio input
            if (topic == '/radio') {
                switch(message.toString()) {
                    case 'play':
                        myLeapApp.radio.play();
                        myLeapApp.sounder.play('on');
                        break;
                    case 'pause':
                        myLeapApp.radio.pause();
                        myLeapApp.sounder.play('off');
                        break;
                    case 'next-track':
                        myLeapApp.sounder.play('next');
                        myLeapApp.radio.nextTrack();
                        break;
                    case 'prev-track':
                        myLeapApp.radio.previousTrack();
                        myLeapApp.sounder.play('prev');
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
        });

    };

    LEAPAPP.Shiftr.prototype.publish = function(topic, message) {
        var uber = this;
        uber.client.publish(topic, message);

    };



}());
