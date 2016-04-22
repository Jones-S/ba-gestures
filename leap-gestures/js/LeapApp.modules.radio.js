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
            'Mistral.mp3',
            'Keine-Ahnung.mp3',
            '05-Stay-Cool.mp3'
        ];

        this.folder = "audio/tracks/";
        this.tracks = addNewTracks(this.folder, this.files);
        this.current_track = this.tracks[0];
        // console.log("this.tracks: ", this.tracks);



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
