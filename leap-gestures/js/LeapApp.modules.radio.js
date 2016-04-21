(function() {

    /**
     * Radio is necessary for playing and controlling the music played in the radio
     */
    LEAPAPP.Radio = function() {
        // constructor

    };

    LEAPAPP.Radio.prototype.play = function(sound) {
        var uber = this;

        switch(sound) {
            case 'on':
                uber.sound_on.play();
                break;
            case 'off':
                uber.sound_off.play();
                break;
            default:
                // do nothing
                break;
        }
    };

}());
