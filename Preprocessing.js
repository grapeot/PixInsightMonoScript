// Configurations. Change this before execution.
// WARNING: the master darks fed into this script should be UNCALIBRATED
// Simple integrate the dark frames to get the master dark
// This script only supports monochrome workflow because the current WBPP is already good enough for OSC cameras
let rootDir = 'D:/Media/Photos/2020/20201229 Heart/Raw';
let outDir = rootDir + '/../Test';
let darkLibrary = {
   '-10C30s': "D:/Media/Photos/DarkFlatLibrary/Dark/6200MM/100gain30s_FF/MasterDarkUncalibrated.xisf",
   '-10C45s': "D:/Media/Photos/DarkFlatLibrary/Dark/6200MM/100gain45s_FF/MasterDarkUncalibrated.xisf",
   '-10C180s': "D:/Media/Photos/DarkFlatLibrary/Dark/6200MM/100gain45s_FF/MasterDarkUncalibrated.xisf",
   '0C300s': "D:/Media/Photos/DarkFlatLibrary/Dark/6200MM/100gain300s_FF/MasterDarkUncalibrated.xisf"
};
let defaultBias = "D:/Media/Photos/DarkFlatLibrary/Bias/6200MM_100gain_FF/masterBias-BINNING_1.xisf";
let channels = [
   {'channel': 'Sii', 'light': 'IC1805S', 'flat': 'IC1805S_Flat', 'dark': darkLibrary['-10C180s']},
   {'channel': 'Oiii', 'light': 'IC1805O', 'flat': 'IC1805O_Flat', 'dark': darkLibrary['-10C180s']},
   {'channel': 'Ha', 'light': 'IC1805Ha', 'flat': 'IC1805H_Flat', 'dark': darkLibrary['-10C180s']}
];

let main = function() {
   let firstCalibratedLight = '';
   let allRegisteredFrames = [];
   for (let channel_i = 0; channel_i < channels.length; channel_i++) {
      // Since we will do flat calibration in the light integration stage, we directly integrate to get the flat
      let rawFlats = findFits(rootDir + '/' + channels[channel_i]['flat']);
      let masterFlatFn = outDir + '/' + channels[channel_i]['channel'] + '_flat.xisf';
      integrate(rawFlats, masterFlatFn);
      
      // light calibration and integration
      inFiles = findFits(rootDir + '/' + channels[channel_i]['light']);
      let calibratedLights = calibrate(inFiles, outDir, defaultBias, channels[channel_i]['dark'], masterFlatFn);
      if (firstCalibratedLight == '') {
         firstCalibratedLight = calibratedLights[0];
      }

      // star alignment
      let registeredLights = starAlign(calibratedLights, firstCalibratedLight, outDir);

      // image integration
      let masterLightFn = outDir + '/' + channels[channel_i]['channel'] + '_light.xisf';
      integrate(registeredLights, masterLightFn);
      console.noteln(channels);

      // housekeeping
      channels[channel_i]['registeredLights'] = registeredLights;
      channels[channel_i]['masterLight'] = masterLightFn;
      registeredLights.forEach(function(x) { allRegisteredFrames.push(x); });
   }

   // final L integration
   let lightFrameFn = rootDir + '/AllL_light.xisf';
   integrate(allRegisteredFrames, lightFrameFn);
}

let findFits = function(dir) {
   return searchDirectory(dir + '/*.fit');
};

// save an image to a file
let saveFile = function(filePath, imageWindow) {
   let F = new FileFormat( ".xisf", false /*toRead*/ , true /*toWrite*/ );
   if ( F.isNull )
      throw new Error( "No installed file format can write " + ".xisf" + " files." ); // shouldn't happen

   let f = new FileFormatInstance( F );
   if ( f.isNull )
      throw new Error( "Unable to instantiate file format: " + F.name );

   let outputHints = "properties fits-keywords no-compress-data block-alignment 4096 max-inline-block-size 3072 no-embedded-data no-resolution up-bottom";
   if ( !f.create( filePath, outputHints ) )
      throw new Error( "Error creating output file: " + filePath );

   let d = new ImageDescription;
   d.bitsPerSample = 32;
   d.ieeefpSampleFormat = true;
   if ( !f.setOptions( d ) )
      throw new Error( "Unable to set output file options: " + filePath );

   if ( F.canStoreImageProperties )
      if ( F.supportsViewProperties )
         imageWindow.mainView.exportProperties( f );

   if ( F.canStoreKeywords )
      f.keywords = imageWindow.keywords;

   if ( !f.writeImage( imageWindow.mainView.image ) )
      throw new Error( "Error writing output file: " + filePath );

   f.close();
};

let integrate = function(infiles, outfile) {
   let inputs = [];
   for (let i = 0; i < infiles.length; i++) {
      // enabled, path, drizzlePath, localNormalizationDataPath
      inputs.push([true, infiles[i], "", ""]);
   }

   let P = new ImageIntegration;
   P.images = inputs;
   P.inputHints = "fits-keywords normalize raw cfa signed-is-physical";
   P.combination = ImageIntegration.prototype.Average;
   P.weightMode = ImageIntegration.prototype.NoiseEvaluation;
   P.weightKeyword = "";
   P.weightScale = ImageIntegration.prototype.WeightScale_BWMV;
   P.adaptiveGridSize = 16;
   P.adaptiveNoScale = false;
   P.ignoreNoiseKeywords = false;
   P.normalization = ImageIntegration.prototype.AdditiveWithScaling;
   P.rejection = ImageIntegration.prototype.WinsorizedSigmaClip;
   P.rejectionNormalization = ImageIntegration.prototype.Scale;
   P.minMaxLow = 1;
   P.minMaxHigh = 1;
   P.pcClipLow = 0.200;
   P.pcClipHigh = 0.100;
   P.sigmaLow = 4.000;
   P.sigmaHigh = 3.000;
   P.winsorizationCutoff = 5.000;
   P.linearFitLow = 5.000;
   P.linearFitHigh = 4.000;
   P.esdOutliersFraction = 0.30;
   P.esdAlpha = 0.05;
   P.esdLowRelaxation = 1.50;
   P.ccdGain = 1.00;
   P.ccdReadNoise = 10.00;
   P.ccdScaleNoise = 0.00;
   P.clipLow = true;
   P.clipHigh = true;
   P.rangeClipLow = true;
   P.rangeLow = 0.000000;
   P.rangeClipHigh = false;
   P.rangeHigh = 0.980000;
   P.mapRangeRejection = true;
   P.reportRangeRejection = false;
   P.largeScaleClipLow = false;
   P.largeScaleClipLowProtectedLayers = 2;
   P.largeScaleClipLowGrowth = 2;
   P.largeScaleClipHigh = false;
   P.largeScaleClipHighProtectedLayers = 2;
   P.largeScaleClipHighGrowth = 2;
   P.generate64BitResult = false;
   P.generateRejectionMaps = false;
   P.generateIntegratedImage = true;
   P.generateDrizzleData = false;
   P.closePreviousImages = false;
   P.bufferSizeMB = 16;
   P.stackSizeMB = 1024;
   P.autoMemorySize = true;
   P.autoMemoryLimit = 0.75;
   P.useROI = false;
   P.roiX0 = 0;
   P.roiY0 = 0;
   P.roiX1 = 0;
   P.roiY1 = 0;
   P.useCache = true;
   P.evaluateNoise = true;
   P.mrsMinDataFraction = 0.010;
   P.subtractPedestals = false;
   P.truncateOnOutOfRange = false;
   P.noGUIMessages = true;
   P.showImages = false;
   P.useFileThreads = true;
   P.fileThreadOverload = 1.00;
   P.useBufferThreads = true;
   P.maxBufferThreads = 8;

   let ok = P.executeGlobal();

   if ( ok )
   {
      let window = ImageWindow.windowById( P.integrationImageId );
      saveFile(outfile, window);
      return outfile;
   }
   else
   {
      console.warningln( " ** Warning: Image Integration failed" );
   }
}

let calibrate = function (infiles, outdir, bias="", dark="", flat="") {
   let inputs = [];
   for (let i = 0; i < infiles.length; i++) {
      // enabled, path
      inputs.push([true, infiles[i]]);
   }

   let P = new ImageCalibration;
   P.targetFrames = inputs;
   P.enableCFA = false;
   P.cfaPattern = ImageCalibration.prototype.Auto;
   P.inputHints = "fits-keywords normalize raw cfa signed-is-physical";
   P.outputHints = "properties fits-keywords no-compress-data no-embedded-data no-resolution";
   P.pedestal = 0;
   P.pedestalMode = ImageCalibration.prototype.Keyword;
   P.pedestalKeyword = "";
   P.overscanEnabled = false;
   P.overscanImageX0 = 0;
   P.overscanImageY0 = 0;
   P.overscanImageX1 = 0;
   P.overscanImageY1 = 0;
   P.overscanRegions = [ // enabled, sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1
      [false, 0, 0, 0, 0, 0, 0, 0, 0],
      [false, 0, 0, 0, 0, 0, 0, 0, 0],
      [false, 0, 0, 0, 0, 0, 0, 0, 0],
      [false, 0, 0, 0, 0, 0, 0, 0, 0]
   ];
   P.masterBiasEnabled = bias != "";
   P.masterBiasPath = bias;
   P.masterDarkEnabled = dark != "";
   P.masterDarkPath = dark;
   P.masterFlatEnabled = flat != "";
   P.masterFlatPath = flat;
   P.calibrateBias = false;
   P.calibrateDark = true;
   P.calibrateFlat = true;
   P.optimizeDarks = true;
   P.darkOptimizationThreshold = 0.00000;
   P.darkOptimizationLow = 3.0000;
   P.darkOptimizationWindow = 1024;
   P.darkCFADetectionMode = ImageCalibration.prototype.DetectCFA;
   P.separateCFAFlatScalingFactors = true;
   P.flatScaleClippingFactor = 0.05;
   P.evaluateNoise = true;
   P.noiseEvaluationAlgorithm = ImageCalibration.prototype.NoiseEvaluation_MRS;
   P.outputDirectory = outdir;
   P.outputExtension = ".xisf";
   P.outputPrefix = "";
   P.outputPostfix = "_c";
   P.outputSampleFormat = ImageCalibration.prototype.f32;
   P.outputPedestal = 0;
   P.overwriteExistingFiles = false;
   P.onError = ImageCalibration.prototype.Continue;
   P.noGUIMessages = true;
   /*
    * Read-only properties
    *
   P.outputData = [ // outputFilePath, darkScalingFactorRK, darkScalingFactorG, darkScalingFactorB, noiseEstimateRK, noiseEstimateG, noiseEstimateB, noiseFractionRK, noiseFractionG, noiseFractionB, noiseAlgorithmRK, noiseAlgorithmG, noiseAlgorithmB
   ];
    */

   let ok = P.executeGlobal();

   if ( ok )
   {
      let output = [];
      for ( let j = 0; j < P.outputData.length; ++j )
         output.push(P.outputData[j][0]);
      return output;
   }
   else
   {
      console.warningln( " ** Warning: Image Calibration failed" );
   }
};

let starAlign = function(infiles, refFile, outdir) {
   let inputs = [];
   for (let i = 0; i < infiles.length; i++) {
      // enabled, isfile, path
      inputs.push([true, true, infiles[i]]);
   }
   
   let P = new StarAlignment;
   P.structureLayers = 5;
   P.noiseLayers = 0;
   P.hotPixelFilterRadius = 1;
   P.noiseReductionFilterRadius = 0;
   P.sensitivity = 0.100;
   P.peakResponse = 0.80;
   P.maxStarDistortion = 0.500;
   P.upperLimit = 1.000;
   P.invert = false;
   P.distortionModel = "";
   P.undistortedReference = false;
   P.distortionCorrection = false;
   P.distortionMaxIterations = 20;
   P.distortionTolerance = 0.005;
   P.distortionAmplitude = 2;
   P.localDistortion = true;
   P.localDistortionScale = 256;
   P.localDistortionTolerance = 0.050;
   P.localDistortionRejection = 2.50;
   P.localDistortionRejectionWindow = 64;
   P.localDistortionRegularization = 0.010;
   P.matcherTolerance = 0.0500;
   P.ransacTolerance = 2.00;
   P.ransacMaxIterations = 2000;
   P.ransacMaximizeInliers = 1.00;
   P.ransacMaximizeOverlapping = 1.00;
   P.ransacMaximizeRegularity = 1.00;
   P.ransacMinimizeError = 1.00;
   P.maxStars = 0;
   P.fitPSF = StarAlignment.prototype.FitPSF_DistortionOnly;
   P.psfTolerance = 0.50;
   P.useTriangles = false;
   P.polygonSides = 5;
   P.descriptorsPerStar = 20;
   P.restrictToPreviews = true;
   P.intersection = StarAlignment.prototype.MosaicOnly;
   P.useBrightnessRelations = false;
   P.useScaleDifferences = false;
   P.scaleTolerance = 0.100;
   P.referenceImage = refFile;
   P.referenceIsFile = true;
   P.targets = inputs;
   P.inputHints = "";
   P.outputHints = "";
   P.mode = StarAlignment.prototype.RegisterMatch;
   P.writeKeywords = true;
   P.generateMasks = false;
   P.generateDrizzleData = false;
   P.generateDistortionMaps = false;
   P.frameAdaptation = false;
   P.randomizeMosaic = false;
   P.noGUIMessages = true;
   P.useSurfaceSplines = false;
   P.extrapolateLocalDistortion = true;
   P.splineSmoothness = 0.050;
   P.pixelInterpolation = StarAlignment.prototype.Auto;
   P.clampingThreshold = 0.30;
   P.outputDirectory = outdir;
   P.outputExtension = ".xisf";
   P.outputPrefix = "";
   P.outputPostfix = "_r";
   P.maskPostfix = "_m";
   P.distortionMapPostfix = "_dm";
   P.outputSampleFormat = StarAlignment.prototype.SameAsTarget;
   P.overwriteExistingFiles = false;
   P.onError = StarAlignment.prototype.Continue;
   P.useFileThreads = true;
   P.fileThreadOverload = 1.20;
   P.maxFileReadThreads = 8;
   P.maxFileWriteThreads = 8;

   let ok = P.executeGlobal();
   if (ok) {
      let images = new Array;
      for ( let c = 0; c < P.outputData.length; ++c )
      {
         let filePath = P.outputData[ c ][ 0 ]; // outputData.outputImage
         if ( filePath != "" )
            if ( File.exists( filePath ) )
               images.push( filePath );
            else
            {
               console.warningln( "** Warning: File does not exist after image registration: " + filePath );
            }
      }
      return images;

   }
   else {
      console.warningln( "** Warning: Error registering light frames." );
   }
}

main();