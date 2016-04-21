(function() {

    /**
     * Sound is necessary for playing confirmatory sounds
     * and other interface related sounds.
     */
    LEAPAPP.Sound = function() {
        // constructor
        this.sound_on   = new Audio('audio/on.mp3');
        this.sound_off  = new Audio('audio/off.mp3');

    };

    LEAPAPP.Sound.prototype.play = function(sound) {
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
