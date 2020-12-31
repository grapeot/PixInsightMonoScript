# PixInsight Monochrome Workflow Script

For DSO photo processing, PixInsights has a Weighted Batch Preprocessing (WBPP) script to simplify the tedious calibration, registration, and integration process.
It's handy for OSC cameras, but we need to do 4 separate WBPPs if we use LRGB workflow for example.
That means four times selecting bias/dark/flat/light frames, and probably wait for one to finish before launching another script if memory is an issue.
To solve this problem (for myself), I wrote this simple script to automate the preprocessing process for monochrome workflows.
One now only needs to specify the frames' locations in the first few lines of code, and then execute the script to get masters of L/R/G/B.

## Usage

1. Click the "Script Editor" in the bottom left corner of PixInsights.
2. Open the script `Preprocessing.js`.
3. Change the variables in the first few lines of code (before the main function).
4. Hit F9 to run.

## Known issues

* FITS headers are not properly set, e.g. total integration time.
* Most parameters are default ones. You may need to tune it to get the optimal performance.
* Current best reference frame selection is pretty naive. Better to use the integrated L as the reference frame.