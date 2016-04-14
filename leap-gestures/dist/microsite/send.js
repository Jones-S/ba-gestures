(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        var client = mqtt.connect('mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io', {
            clientId: 'smartphone'
        });

        client.on('connect', function() {
            console.log('client has connected!');
        });

        $('button#on').on( "click", function() {
            client.publish('/lamp', 'on');
            console.log("Lamp On");
        });

        $('button#off').on( "click", function() {
            client.publish('/lamp', 'off');
            console.log("Lamp Off");
        });

    });
}(jQuery));