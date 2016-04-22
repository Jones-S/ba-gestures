(function() {

    function addNewTracks(directory, files) {
        var tracks = [];
        for (var i = files.length - 1; i >= 0; i--) {
            var track = new Audio(directory + files[i]);
            tracks.push(track);
        }
        return tracks;
    }

    /**
     * Radio is necessary for playing and controlling the music played in the radio
     */
    LEAPAPP.Radio = function() {
        // constructor
        this.files = [
            // '01-Steady-As-She-Goes.mp3',
            // '1-02-Full-Clip.mp3',
            // '02-Cream-on-Chrome.mp3',
            '06-Illegalize-It.mp3',
            '06-Money.mp3',
            '07-Schickt-mir-die-Post.m4a',
            '12-Haschisch-Kakalake.mp3',
            'Keine-Ahnung.mp3',
            'Mistral.mp3'
        ];
        this.folder = "audio/tracks/";

        this.tracks = addNewTracks(this.folder, this.files);
        // console.log("this.tracks: ", this.tracks);
        console.log("larasd 7723 134 ");



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
