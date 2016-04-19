(function() {

    /**
     * Radio is necessary for playing confirmatory sounds
     * and other interface related sounds.
     */
    LEAPAPP.Radio = function() {
        // constructor
        this.sound_on = new Audio('audio_file.mp3');

    };

    LEAPAPP.Typewriter.prototype.play = function(sound) {
        var uber = this;

        switch(sound) {
            case 'on':
                uber.sound_on.play();
                break;
            case 'off':
                break;
            default:
                // do nothing
                break;
        }
    };

}());
