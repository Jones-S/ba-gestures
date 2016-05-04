


function main() {
    var docWidth = 700;
    var docHeight = 700;
    var amountOfArtboards = 1;
    var circleRadius = 2;
    var numberOfRings = 1;
    var horizontalDistance = 19;
    var amountsOfCircles = 6; // the amount of the circles in the first ring, will increase over time

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

    doc.defaultFilled = true;
    doc.defaultStroked = false;
    doc.defaultFillColor = fillColor;


    // draw center circle ellipse(['bottom'], [left], [height], [width])
    // bottom is actually top but somehow my ruler is inversed
    var pi = activeDocument.activeLayer.pathItems.ellipse(centerPoint.y, centerPoint.x, circleRadius*2, circleRadius*2);

    // for each ring add circles
    for (var i = numberOfRings - 1; i >= 0; i--) {
        var angle = 360 / amountsOfCircles; // with 6 its 30°
        var currentAngle = 0;

        // determine first position of circle
        var firstPoint = { x: 0, y: 0};
        firstPoint.x = currentPoint.x;
        firstPoint.y = currentPoint.y + horizontalDistance;

        for (var j = amountsOfCircles - 1; j >= 0; j--) {
            // determine new point
            var newCenterpoint = calculatePosition(currentAngle, horizontalDistance, centerPoint);
            // draw new circle
            var circle = activeDocument.activeLayer.pathItems.ellipse(newCenterpoint.y, newCenterpoint.x, circleRadius*2, circleRadius*2);
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