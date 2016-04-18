(function() {

    // private functions go here

    /**
     * stateMachine object controlls the different
     * steps of a segment, initializes new segment instances
     * and controls onEnter, onGestureCheck and [onLeave]
     */
    LEAPAPP.Mediator = function() {
        // constructor
        this.name = "mediator";
        this.topics = {};

    };

    LEAPAPP.Mediator.prototype.subscribe = function(listener, topic) {
        var uber = this;

        // check if topic was sent, otherwise set it to 'any'
        topic = topic || 'any';
        // Create the topic's object if not yet created
        // and store the new listener in it
        if (!uber.topics.hasOwnProperty(topic)) {
            uber.topics[topic] = [];
        }

        // console.log("listener: ", listener);

        // Add the listener to queue and store the positoin in index
        var index = uber.topics[topic].push(listener) - 1;

    };

    LEAPAPP.Mediator.prototype.unsubscribe = function(listener, topic) {
        var uber = this;
        topic = topic || 'any';
        var subscribers = uber.topics[topic];

        // iterate through all subscribers of the given topic
        for (var i = 0; i < subscribers.length; i++) {
            if (subscribers[i] === listener) {
                // remove one element at index i from array
                subscribers.splice(i, 1);
            }
        }
    };

    LEAPAPP.Mediator.prototype.publish = function(topic, gesture_data, data) {
        // If the topic doesn't exist, or there's no listeners in queue, just leave
        var uber = this;

        if (!uber.topics.hasOwnProperty(topic)) return;

        // Cycle through topics queue, fire!
        for (var i = 0; i < uber.topics[topic].length; i++) {
            // check if on Enter is finished and then call onGestureCheck
            if (uber.topics[topic][i].played_fns.on_enter) {
                // take the subscribers (= instances of Segment())
                // and execute their functions while passing the gesture data
                uber.topics[topic][i].onGestureCheck(gesture_data, data);
            }
        }


    };

}());
