// example:
// c1 = [1, 0, 0]: red
// c2 = [0, 1, 0]: green
// c3 = [0, 0, 1]: blue
function tryColor(c1, c2, c3) {
    var colors = [[c1[0], c2[0], c3[0]],
        [c1[1], c2[1], c3[1]],
        [c1[2], c2[2], c3[2]]];
    for(var i = 0; i < 3; i++) {
        var sum = 0.0;
        for (var j = 0; j < colors[i].length; j++) {
            sum += colors[i][j]
        }
        for (var j = 0; j < colors[i].length; j++) {
            colors[i][j] /= sum;
        }
    }
    exps = ['S * ' + colors[0][0] + ' + H * ' + colors[0][1] + ' + O * ' + colors[0][2],
        'S * ' + colors[1][0] + ' + H * ' + colors[1][1] + ' + O * ' + colors[1][2],
        'S * ' + colors[2][0] + ' + H * ' + colors[2][1] + ' + O * ' + colors[2][2]];
    console.writeln(exps);

    var P = new PixelMath;
    P.expression = exps[0];
    P.expression1 = exps[1];
    P.expression2 = exps[2];
    P.expression3 = "";
    P.useSingleExpression = false;
    P.symbols = "";
    P.clearImageCacheAndExit = false;
    P.cacheGeneratedImages = false;
    P.generateOutput = true;
    P.singleThreaded = false;
    P.optimization = true;
    P.use64BitWorkingImage = false;
    P.rescale = false;
    P.rescaleLower = 0;
    P.rescaleUpper = 1;
    P.truncate = true;
    P.truncateLower = 0;
    P.truncateUpper = 1;
    P.createNewImage = true;
    P.showNewImage = true;
    P.newImageId = "";
    P.newImageWidth = 0;
    P.newImageHeight = 0;
    P.newImageAlpha = false;
    P.newImageColorSpace = PixelMath.prototype.RGB;
    P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;

    let ok = P.executeOn(ImageWindow.activeWindow.currentView, false);

    //var P = new SCNR;
    //P.amount = 0.90;
    //P.protectionMethod = SCNR.prototype.AverageNeutral;
    //P.colorToRemove = SCNR.prototype.Green;
    //P.preserveLightness = true;

    //let ok = P.executeOn(ImageWindow.activeWindow.currentView, false);
}

/* from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 * accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b];
}

function main() {
    const hue1 = Math.random(), hue2 = Math.random(), hue3 = Math.random();
    const c1 = HSVtoRGB(hue1, 1, 1);
    const c2 = HSVtoRGB(hue2, 1, 1);
    const c3 = HSVtoRGB(hue3, 1, 1);
    tryColor(c1, c2, c3);
}

main();
