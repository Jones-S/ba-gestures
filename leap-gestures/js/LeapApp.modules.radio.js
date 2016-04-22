(function() {

    function completeFilePath(directory, files) {
        var tracks = [];

        // looping reversly. File order will be in reverse
        for (var i = files.length - 1; i >= 0; i--) {
            var file = directory + files[i];
            tracks.push(file);
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
            'Mistral.mp3',
            'Keine-Ahnung.mp3',
            '05-Stay-Cool.mp3'
        ];

        this.folder = "audio/tracks/";
        this.files = completeFilePath(this.folder, this.files);
        console.log("this.files: ", this.files);

        this.sounds = new Howl({
            urls: this.files,
            autoplay: true,
            loop: false,
            volume: 0.5,
            onend: function() {
                console.log('Finished!');
            }
        });



    };

    LEAPAPP.Radio.prototype.play = function() {
        var uber = this;
        uber.current_track.play();
    };

    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
        uber.current_track.pause();
    };

}());
