


function main() {
    var docWidth = 700;
    var docHeight = 700;
    var amountOfArtboards = 1;
    var circleRadius = 5;
    var numberOfRings = 3;
    var horizontalDistance = 13;
    var amtOfCircInFirstRing = 6; // the amount of the circles in the first ring

    var centerPoint = {
        x: (docWidth/2) + circleRadius,
        y: (docHeight/2) - circleRadius
    };

    var currentPoint = {
        x: centerPoint.x,
        y: centerPoint.y
    };

    // add a new document
    var doc = app.documents.add(DocumentColorSpace.RGB, docWidth, docHeight, amountOfArtboards);

    var fillColor = new RGBColor();
    fillColor.red   = 0;
    fillColor.green = 0;
    fillColor.blue  = 0;

    doc.defaultFillColor = fillColor;
    doc.defaultFilled = true;
    doc.defaultStroked = false;


    // draw center circle ellipse(['bottom'], [left], [height], [width])
    // bottom is actually top but somehow my ruler is inversed
    pi = activeDocument.activeLayer.pathItems.ellipse(centerPoint.x, centerPoint.y, circleRadius*2, circleRadius*2);

    // for each ring add circles
    for (var i = numberOfRings - 1; i >= 0; i--) {
        var distance = 360 / amtOfCircInFirstRing; // with 6 its 30°
        // determine first position of circle
        var firstPoint;
        firstPoint.x = currentPoint.x;
        firstPoint.y = currentPoint.y + horizontalDistance;
    }




}



// Execute main function
main();