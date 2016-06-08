(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        // add class to hamburger button to animate to cross
        $('#btn--activate-menu').on('click', function(){
            $(this).toggleClass('is-active');
            $('.nav__list').toggleClass('nav__list-active');
        });




        /*Shiftr Stuff*/

         var client = mqtt.connect('mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io', {
            clientId: 'Remote Client'
        });

        client.on('connect', function() {
            console.log('client has connected!');
        });



        /*Radio Buttons*/

        $('#btn--play').on( "click", function() {
            client.publish('/radio', 'play');
        });

        $('#btn--pause').on( "click", function() {
            client.publish('/radio', 'pause');
        });

        $('#btn--next').on( "click", function() {
            client.publish('/radio', 'next-track');
        });

        $('#btn--prev').on( "click", function() {
            client.publish('/radio', 'prev-track');
        });

        $('#btn--volup').on( "click", function() {
            client.publish('/radio', 'vol-up');
        });

        $('#btn--voldown').on( "click", function() {
            client.publish('/radio', 'vol-down');
        });







        // $('').on( "click", function() {
        //     client.publish('/lamp', 'brighter');
        //     console.log("lamp led-up");
        // });

        // $('').on( "click", function() {
        //     client.publish('/lamp', 'lessbright');
        //     console.log("lamp led-down");
        // });

        // $('').on( "click", function() {
        //     client.publish('/lamp', 'brightness-140');
        // });

        // $('').on( "click", function() {
        //     client.publish('/lamp', 'brightness-40');
        // });

        // $('').on( "click", function() {
        //     client.publish('/sound', 'on');
        // });


    });
}(jQuery));
//# sourceMappingURL=maps/all.js.map
