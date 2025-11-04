# Epicenter Search

## Description

This is a small web project I created during a high-school geography project to demonstrate a simple method for estimating the epicenter of an earthquake using arrival times from seismic stations.

The idea: given three (or more) seismic stations that detected the event, and the relative times (or time differences) to the seismic waves, you can draw circles centered at each station with radii proportional to the travel time (or distance). The intersection of those circles gives an estimate of the earthquake epicenter. This website implements a basic version of that algorithm visually on a Google Map so you can enter station positions and times and get a visual/approximate epicenter estimate.

## What this repo contains

- `index.html` — The main HTML page that loads the map and the app UI (tables for station data and output). It includes the Google Maps API script and links to the JavaScript and CSS files.
- `index.js` — The JavaScript application logic. Handles creating markers, computing distances using Google Maps geometry utilities, the grid-search helper for refining the epicenter estimate, building the table rows in the UI, and the UI controls (calculate, reset, delete markers).
- `style.css` — Custom styles for the page and map layout. Ensures the map and tables layout correctly and includes a few UI styles.
- `bootstrap.css` / `bootstrap.min.css` — Bootstrap framework styles used to make tables and buttons look consistent. (Minified and full versions included.)

## Code walkthrough

This section explains the two main files that implement the app logic and the page structure so you can quickly find where to change behavior.

### `index.html`

- Purpose: page skeleton and UI container. It loads styles, the app script, and the Google Maps JavaScript API.
- Important elements and attributes:
	- `<link href="style.css">`, `<link href="bootstrap.min.css">`, `<link href="bootstrap.css">` — styles for layout and Bootstrap components.
	- `<script type="module" src="index.js"></script>` (in the `<head>`) and later a plain `<script src="index.js"></script>` at the bottom. The file is included twice in the current copy: once as an ES module and once as a normal script. Consider keeping only one include (preferably the bottom non-module include unless you rely on ES module features) to avoid double execution.
	- Google Maps API script tag (near the bottom) that provides the `google.maps` namespace. The current src includes an API key and requests the `geometry` and `marker` libraries. Make sure the key is valid, and consider moving the key out of the source before publishing.
	- Main UI elements the script interacts with:
		- Table `#mySection` (station table) with `tbody` id `tbody` where marker rows are inserted.
		- Button `#calculate` which calls the `calc()` function to compute the epicenter.
		- Error message elements `#error_code_much` and `#error_code_less` that are shown when marker count is incorrect.
		- Output table `#myOutput` with `tbody` id `tbodyOutput` where computed distances are appended.
		- Map container `#map` (inside `#mapContainer`) where the Google Map is rendered.

### `index.js`

`index.js` contains the application logic. Below is a high-level overview of its main variables and functions and where the program flow goes.

- Key global state:
	- `map` — the Google Map instance created in `initMap()`.
	- `markers` — array holding the map Marker objects for the user-added stations.
	- `markersGrid` — temporary markers used by the grid-search helper for visualization.
	- `uniqueID` / `IDCounter` — small counters used to id rows and markers.

- Important functions and responsibilities:
	- `initMap()`
		- Creates the Google Map centered on a fixed position.
		- Registers a `click` listener on the map so clicking the map adds a station marker (and a table row) using `createMarker()` and `createMarkerModel()`.
		- Adds a small "Reset map" UI control which calls `resetMap()` when clicked.

	- `createMarkerModel(mytitle, uniqueID)`
		- Builds a new table row in `#mySection` for each added marker. The row contains fields for ID, latitude, longitude, name, a time input (time-to-epicenter), and a delete button wired to `DeleteMarker()`.
		- `mytitle` is parsed (it comes from the marker position text) to extract latitude and longitude to populate the inputs.

	- `createMarker(...)` and `createTestMarker(...)`
		- (Helper functions) create actual `google.maps.Marker` objects and insert them on the map; these also wire up click/drag events and keep `markers[]` in sync with the table. (The code contains details for marker icons and info windows.)

	- `DeleteMarker(id)`
		- Removes the marker from the `markers` array, removes the corresponding table row, and updates UI elements and counters.

	- `Mydistance(ID1, ID2)`
		- Uses `google.maps.geometry.spherical.computeDistanceBetween()` to compute the straight-line distance (in kilometers) between two markers referenced by their indices in `markers[]`. Returns distance in kilometers.

	- `printDistance(ID, distance, distancex_y, run)`
		- Appends a row to the output table (`#myOutput`) showing the computed distances for each station.

	- `deleteGridMarkers()`
		- Clears any temporary grid markers (`markersGrid`) that were added for the visualization of the grid search.

	- `grid(topGrid, distance0, distance1, distance2, side, steps, bool)`
		- Implements a brute-force/grid search that iteratively samples locations in a square grid and tries to find the location whose distances to the three stations best match the three provided distances. The function supports a refinement step (smaller `steps`) and can optionally place temporary markers for visualization when `bool == true`.
		- This is the core search routine used by `setGrid()`.

	- `setGrid(pos0, pos1, pos2, distance0, distance1, distance2, distance0_1, distance1_2, distance2_0)`
		- Prepares the search grid (a square centered near the station centroid), computes a starting top corner and grid spacing, and calls `grid()` to do the coarse and refined searches. It also creates `markersGrid` for the top/center and final search visualization.

	- `calc()`
		- Orchestrates the whole calculation when the user clicks the "calculate Epicenter" button.
		- Validates the table has exactly three marker rows (the code currently expects three markers). It reads the time values from the time input fields in the table and computes `distance0 = td1 * 12` (and similarly for the others). Note: the multiplier `12` is a constant used by the demo to convert the time to a distance — change this number if you'd like a different scale or use a physical wave speed instead.
		- Calls `Mydistance()` for inter-station distances (useful to the output), then calls `setGrid()` to run the search and `printDistance()` to fill the output table.

	- `resetMap()`
		- Removes all markers and clears table rows to reset the app to the initial state.

- Notes on constants and behavior you may want to change while developing:
	- The `td* * 12` conversion in `calc()` (time-to-distance multiplier) — adjust if you want a different conversion (e.g., use a velocity variable instead).
	- Grid spacing and step sizes used by `grid()` and `setGrid()` (values like `0.008`, multipliers like `1.25`, and the `steps` passed to `grid()`) control search resolution and performance. Reducing the search area or increasing steps improves speed but may lose precision.
	- The app currently expects exactly three markers for the `calc()` routine; you can extend the logic to support more than three stations by changing how distances are aggregated (e.g., least-squares fit).

## Where to look to change behavior quickly

- If you want to change the map initialization, open `index.js` → `initMap()`.
- To change the conversion from time to distance, edit `calc()` and replace the `* 12` multiplier with a configurable variable (or a small UI control to input wave speed).
- To replace the grid-search with an analytical trilateration solver (closed-form for three circles), implement the solver and call it from `calc()` instead of `setGrid()`.

## Quick demo / how to use

1. Open `index.html` in a browser (the page uses the Google Maps JavaScript API, so an internet connection is required).
2. Click anywhere on the map to add station markers. Each marker adds a row to the station table (`#mySection`) with fields for latitude, longitude, name, and a time input field used for the distance estimate.
3. Enter the (relative) time-to-epicenter for each station in the table. The app multiplies the time by a constant to convert to a distance (this is a simplified model used for the demo).
4. When you have three markers, click the "calculate Epicenter" button to run the grid-search algorithm and show the computed center and a small grid demonstration on the map. Output will appear in the output table (`#myOutput`).

## Notes and limitations

- This is a teaching/demo project, not a production-grade seismic analysis tool. The conversion from time to distance is simplified and the algorithm is a brute-force/grid refinement search (sufficient for a small demo but not for precise geophysical work).
- The app depends on the Google Maps JavaScript API and the geometry library for distance calculations. Make sure the API key in `index.html` is valid if you want to run the map.
- The UI expects exactly three markers for the calculation routine implemented; the page contains small checks and warnings when there are too few or too many markers.

## Developer notes / contract

- Inputs: three or more map markers (latitude/longitude) and a scalar time value per station (entered in the table).
- Output: a best-guess epicenter position computed by a grid search refinement and a small set of distances shown in the output table; also temporary grid markers shown on the map.
- Success criteria: when three valid markers with numeric time values are present, the "calculate" action displays grid markers and fills the output table.
- Error modes: missing or non-numeric inputs will prevent calculation; the app shows simple warnings in the UI when marker count != 3.

## Edge cases to consider

- Non-numeric or empty time inputs. (App currently expects numeric values.)
- Markers placed extremely far apart may make the fixed grid-search parameters ineffective.
- Internet / Google Maps API errors: the map requires the API and geometry library.

## Possible improvements (ideas)

- Replace the simplified time-to-distance conversion with a configurable velocity model or allow the user to set wave speed.
- Replace brute-force grid search with a geometric trilateration solver for three stations (analytical solution), and use the grid-search only for validation or when more than three stations are used.
- Improve UI validation and show the estimated epicenter coordinates on the map with a clearer marker and optional uncertainty circle.
- Add unit tests for the geometric/distance computations.

## License & credits

This project was created as a school exercise and may be used for educational purposes. Add your preferred license if you want to publish this on GitHub for others to reuse.

## Contact / author

Created by the original author as a high-school geography project; see the repository for the source files and code.

Enjoy exploring earthquake epicenter estimation!
