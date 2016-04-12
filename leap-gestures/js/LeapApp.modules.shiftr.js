(function() {

    LEAPAPP.Shiftr = function(data) {
        // constructor
        this.name = "Shiftr";
        this.mqtt = data.mqtt_uri;
        this.client_id = data.client_id;
        this.lamp_on = false;
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

        $("body").on( "click", function() {
            if (!uber.lamp_on) {
                uber.client.publish('/lamp', 'on');
                uber.lamp_on = true;
                console.log("on");
            } else {
                uber.client.publish('/lamp', 'off');
                uber.lamp_on = false;
                console.log("off");
            }
        });


    };

    LEAPAPP.Shiftr.prototype.publish = function(topic, message) {
        var uber = this;
        // uber.client.publish('/lamp', 'on');

    };



}());
