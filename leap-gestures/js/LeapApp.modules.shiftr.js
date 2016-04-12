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

            // uber.client.subscribe('/lamp');
            // client.unsubscribe('/example');

        });

        this.client.on('message', function(topic, message) {
            console.log('new message:', topic, message.toString());
        });

    };

    LEAPAPP.Shiftr.prototype.publish = function(topic, message) {
        var uber = this;
        uber.client.publish(topic, message);

    };



}());
