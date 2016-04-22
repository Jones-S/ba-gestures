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

        $('button#play').on( "click", function() {
            client.publish('/radio', 'play');
            console.log("Radio Play");
        });

        $('button#pause').on( "click", function() {
            client.publish('/radio', 'pause');
            console.log("Radio pause");
        });

        $('button#next-track').on( "click", function() {
            client.publish('/radio', 'next-track');
            console.log("Radio next-track");
        });

        $('button#prev-track').on( "click", function() {
            client.publish('/radio', 'prev-track');
            console.log("Radio prev-track");
        });



    });
}(jQuery));