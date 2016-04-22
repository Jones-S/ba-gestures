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

        this.current_track = 0;
        // playlistUrls = [
        //         "./audio/cmn-ni3.mp3",
        //         "./audio/cmn-hao3.mp3",
        //         "./audio/cmn-lao3.mp3",
        //         "./audio/cmn-mao3.mp3"
        //     ], // audio list
        this.howlerBank = [];
        this.loop = true;
        var uber = this;

        // build up howlerBank:
        this.files.forEach(function(current, i) {
            uber.howlerBank.push(new Howl({
                urls: [uber.files[i]],
                // execute onEnd when finished and bind this(=uber) context
                // otherwise the this in the function onEnd will refer to the Howl context
                onend: uber.onEnd.bind(uber),
                buffer: true
            }));
        });

        // initiate the whole :
        this.howlerBank[0].play();




    };

    LEAPAPP.Radio.prototype.play = function() {
        var uber = this;
    };

    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
    };

    // playing i+1 audio (= chaining audio files)
    LEAPAPP.Radio.prototype.onEnd = function() {
        var uber = this;
        if (uber.loop === true) {
            // check if current track is more than number of all tracks, otherwise reset to 0
            uber.current_track = (uber.current_track + 1 !== uber.howlerBank.length) ? uber.current_track + 1 : 0;
        } else {
            uber.current_track = uber.current_track + 1;
        }
        uber.howlerBank[uber.current_track].play();
    };

}());
