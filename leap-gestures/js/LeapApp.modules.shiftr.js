(function() {

    LEAPAPP.Shiftr = function(data) {
        // constructor
        this.name = "Shiftr";
        this.mqtt = data.mqtt_uri;
        this.client_id = data.client_id;

        var client = mqtt.connect(this.mqtt, {
            clientId: this.client_id
        });

        client.on('connect', function() {
            console.log('client has connected!');

            client.subscribe('/example');
            // client.unsubscribe('/example');

            setInterval(function() {
                client.publish('/hello', 'world');
            }, 1000);
        });

        client.on('message', function(topic, message) {
            console.log('new message:', topic, message.toString());
        });

    };

    LEAPAPP.Shiftr.prototype.method = function() {

    };



}());
