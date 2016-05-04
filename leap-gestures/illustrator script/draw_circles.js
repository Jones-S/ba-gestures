


function main() {
    var doc;
    // if document is open then use that
    if ( app.documents.length > 0 ) {
        doc = app.activeDocument;
    } else {
        // otherwise create one
        var width = 700;
        var height = 700;
        var amountOfArtboards = 1;
        doc = app.documents.add(null, width, height, amountOfArtboards);
    }
    // doc.units = Pixels;

    var fillColor = new RGBColor();
    fillColor.red   = 0;
    fillColor.green = 0;
    fillColor.blue  = 0;

    // alert("Drawing a lot of circles.");
    // draw a circle ellipse([bottom], [left], [height], [width])
    pi = activeDocument.activeLayer.pathItems.ellipse(600, 300, 10, 10);

    pi.filled = true;
    pi.stroked = false;
    pi.fillColor = fillColor;

}



// Execute main function
main();