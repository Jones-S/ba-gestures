/**
 Draw Dot-Circle Pattern with Illustrator
 Copyright(c) 2016 Jonas Scheiwiller
 Wed 4 May 2016 18:14:18

 JavaScript Script for Adobe Illustrator CC 2015
 Tested with Adobe Illustrator CC 19.2.1, Mac OS X El Capitan.
 This script provided "as is" without warranty of any kind.
 Free to use and distribute.

 Usage:
 Define amount of Rings [numberOfCircles] and how many dots per ring you want [numberOfDots].
 Of course document width and height can be changed as well, but this can be done in Illustrator as well.




 */


function main() {
    // some settings
    var docWidth = 700; // document width
    var docHeight = 700; // document height
    var amountOfArtboards = 1; // amount of artboards
    var dotRadius = 2; // radius of the dots
    var numberOfCircles = 12; // amount of total circles
    var horizontalDistance = 19; // distance to next dot
    var numberOfDots = 9; // the amount of dots in the first circle. This number will increase over time.

    var centerPoint = {
        x: (docWidth/2) + dotRadius,
        y: (docHeight/2) - dotRadius
    };




    // add a new document
    var doc = app.documents.add(DocumentColorSpace.RGB, docWidth, docHeight, amountOfArtboards);

    var fillColor = new RGBColor();
    fillColor.red   = 0;
    fillColor.green = 0;
    fillColor.blue  = 0;

    doc.defaultFilled = true;
    doc.defaultStroked = false;
    doc.defaultFillColor = fillColor;


    // draw center circle ellipse(['bottom'], [left], [height], [width])
    // bottom is actually top but somehow my ruler is inversed
    var pi = activeDocument.activeLayer.pathItems.ellipse(centerPoint.y, centerPoint.x, dotRadius*2, dotRadius*2);

    // for each ring add circles
    for (var i = 1; i <= numberOfCircles; i++) {
        var angle = 360 / (i * numberOfDots); // with 6 its 30°
        var currentAngle = 0;

        // determine first position of circle
        var firstPoint = {
            x: centerPoint.x,
            y: centerPoint.y + ((i + 1) * horizontalDistance)
        };

        for (var j = (i * numberOfDots) - 1; j >= 0; j--) {
            // determine new point
            var newCenterpoint = calculatePosition(currentAngle, (i * horizontalDistance), centerPoint);
            // draw new circle
            var circle = activeDocument.activeLayer.pathItems.ellipse(newCenterpoint.y, newCenterpoint.x, dotRadius*2, dotRadius*2);
            // and increase angle
            currentAngle += angle;
        }



    }

}

function calculatePosition(angleInDegrees, radiusOfRing, centerPoint){
    // Convert from degrees to radians via multiplication by PI/180
    var x = (radiusOfRing * Math.cos(angleInDegrees * Math.PI / 180)) + centerPoint.x;
    var y = (radiusOfRing * Math.sin(angleInDegrees * Math.PI / 180)) + centerPoint.y;

    return {x: x, y: y};
}



// Execute main function
main();