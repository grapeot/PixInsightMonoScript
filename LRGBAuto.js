function linearFit(isSHO) {
   var P = new LinearFit;
   P.referenceViewId = isSHO ? "H": "L";
   P.rejectLow = 0.000000;
   P.rejectHigh = 0.920000;
   if (isSHO) {
      var ok = P.executeOn(ImageWindow.windowById("S").currentView, false);
      ok = P.executeOn(ImageWindow.windowById("O").currentView, false);
   } else {
      var ok = P.executeOn(ImageWindow.windowById("R").currentView, false);
      ok = P.executeOn(ImageWindow.windowById("G").currentView, false);
      ok = P.executeOn(ImageWindow.windowById("B").currentView, false);
   }
}

/*
function generateRGB(isSHO) {
   var P = new LRGBCombination;
   P.channels = isSHO? [ // enabled, id, k
      [true, "S", 1.00000],
      [true, "H", 1.00000],
      [true, "O", 1.00000],
      [false, "", 1.00000]
   ] : [ // enabled, id, k
      [true, "R", 1.00000],
      [true, "G", 1.00000],
      [true, "B", 1.00000],
      [false, "", 1.00000]
   ];
   P.mL = 0.500;
   P.mc = 0.500;
   P.clipHighlights = true;
   P.noiseReduction = false;
   P.layersRemoved = 4;
   P.layersProtected = 2;
   let ok = P.executeGlobal();
}
*/

function generateRGB(isSHO) {
   var P = new PixelMath;
   P.expression = isSHO? "S" : "R";
   P.expression1 = isSHO ? "H" : "G";
   P.expression2 = isSHO ? "O": "B";
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
   P.newImageId = "Color";
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.RGB;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   let ok = P.executeOn(ImageWindow.windowById(isSHO ? "H": "L").currentView, false);

   /*
    * Read-only properties
    *
   P.outputData = [ // globalVariableId, globalVariableRK, globalVariableG, globalVariableB
   ];
    */

}

function generateL(isSHO) {
   var P = new PixelMath;
   P.expression = isSHO? "H*0.5+O*0.2+S*0.3" : "R*0.1+G*0.1+B*0.1+L*0.7";
   P.expression1 = "";
   P.expression2 = "";
   P.expression3 = "";
   P.useSingleExpression = true;
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
   P.newImageId = "SynthL";
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.Gray;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   let ok = P.executeOn(ImageWindow.windowById(isSHO ? "H": "L").currentView, false);

   /*
    * Read-only properties
    *
   P.outputData = [ // globalVariableId, globalVariableRK, globalVariableG, globalVariableB
   ];
    */
}

function combineColorL(isSHO) {
   var P = new LRGBCombination;
   P.channels = [ // enabled, id, k
      [false, "", 1.00000],
      [false, "", 1.00000],
      [false, "", 1.00000],
      [true, "SynthL", 1.00000]
   ];
   P.mL = 0.500;
   P.mc = 0.500;
   P.clipHighlights = true;
   P.noiseReduction = false;
   P.layersRemoved = 4;
   P.layersProtected = 2;
   let ok = P.executeOn(ImageWindow.windowById("Color").currentView, false);
}

function autoCombineLRGB() {
   // First rename the views to L, R, G, B.
   linearFit();
   generateRGB();
   generateL();
}

function autoCombineSHO() {
   // First rename the views to L, R, G, B.
   // linearFit(true);
   generateRGB(true);
   generateL(true);
   combineColorL(true);
}


autoCombineSHO();
