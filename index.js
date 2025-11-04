/**
 * Returns a random lat lng position within the map bounds.
 * @param {!google.maps.Map} map
 * @return {!google.maps.LatLngLiteral}
 */
let uniqueID = 1;
let IDCounter = 1;
let markers = [];
var map;
let markersTest = [];
let markersGrid = [];

function grid(topGrid, distance0, distance1, distance2, side, steps, bool){
  console.log("grid");
  if (steps > 1){
    side = side / steps;
    var sideLng = side*1.5;
    var sideLat = side;
  }
  else if(steps < 1){
    side = 400;
    var sideLng = side*1.5;
    var sideLat = side;
  }
  steps = steps * 0.008;

  var lat;
  lat = Object.assign({}, topGrid);

  var newMarker;
  newMarker = Object.assign({}, topGrid);

  console.log("newMarker: ", newMarker);  

  lat = lat.lat;

  let bestLoc;

  var distanceTogetherOld;
  var distanceTogether;

  for (var i = 0; i < sideLng;i++) {
    // newMarker.lat = parseFloat(Object.assign({}, lat));
    newMarker.lat = lat;

    for (var j = 0; j < sideLat;j++) {
    // console.log("newMNarke:", newMarker);
    createTestMarker(newMarker, false);

    // if(j == 0){
    //   createTestMarker(newMarker, true);
    // }
    // console.log("test:", markersTest[0]);  
      var distanceToEpicenter0 = google.maps.geometry.spherical.computeDistanceBetween(markers[0].getPosition(), markersTest[0].getPosition()) * 0.001;
      var distanceToEpicenter1 = google.maps.geometry.spherical.computeDistanceBetween(markers[1].getPosition(), markersTest[0].getPosition()) * 0.001;
      var distanceToEpicenter2 = google.maps.geometry.spherical.computeDistanceBetween(markers[2].getPosition(), markersTest[0].getPosition()) * 0.001;

      distanceToEpicenter0 = distanceToEpicenter0 - distance0;
      distanceToEpicenter1 = distanceToEpicenter1 - distance1;
      distanceToEpicenter2 = distanceToEpicenter2 - distance2;

      if(distanceToEpicenter0 < 0){
        distanceToEpicenter0 = -distanceToEpicenter0;
      }
      if(distanceToEpicenter1 < 0){
        distanceToEpicenter1 = -distanceToEpicenter1;
      }
      if(distanceToEpicenter2 < 0){
        distanceToEpicenter2 = -distanceToEpicenter2;
      }
      
      distanceTogether = distanceToEpicenter0 + distanceToEpicenter1 + distanceToEpicenter2;
      
      if(i==0 && j==0){
        distanceTogetherOld = distanceTogether;
      }

      if(distanceTogether < distanceTogetherOld){
        bestLoc = Object.assign({}, newMarker);

        // console.log("I: ", j);
        // console.log("distanceTogether", distanceTogether);
        // console.log("distanceTogetherOld", distanceTogetherOld);
        distanceTogetherOld = distanceTogether;
      }
      newMarker.lat -= steps;
  
      markersTest[0].setMap(null);
  
      //Remove the marker from array.
      markersTest.splice(0, 1);
    }
    // console.log(i);

    newMarker.lng += steps;

    // console.log("bestloc: ", bestLoc);
    // console.log("newmarker:", newMarker);
  }
  console.log("best: ", bestLoc);

  if(bool == true){
    createTestMarker(bestLoc, true);
  
  }
  return bestLoc;
}

function setGrid(pos0, pos1, pos2, distance0, distance1, distance2, distance0_1, distance1_2, distance2_0){
  var side = (distance0 + distance1 + distance2) * 1.25;

  console.log("side: ", side);

  var centerLat = (pos0.lat + pos1.lat + pos2.lat) / 3;
  var centerLng = (pos0.lng + pos1.lng + pos2.lng) / 3;

  var centerGrid = { lat: centerLat, lng: centerLng};

  var RadToDeg = Math.PI / 180;

  var startLat = Math.sin(centerGrid.lat*RadToDeg) * 0.008 * side;
  var startLng = 0.008 * side; 

  console.log("startLat: ", startLat);
  console.log("startLng: ", startLng);

  var topGrid = {lat: centerGrid.lat+(startLat), lng: centerGrid.lng-(startLng)}

  var topMarker = new google.maps.Marker({ position: topGrid, map: map, title:"top"});
  var centerMarker = new google.maps.Marker({ position: centerGrid, map: map , title:"center"});

  var newBestLoc = grid(topGrid, distance0, distance1, distance2, side, 10, false);
  
  newBestLoc.lat += 15 * 0.008;
  newBestLoc.lng -= 15 * 0.008;

  grid(newBestLoc, distance0, distance1, distance2, side, 0.1, true);
  markersGrid[1] = topMarker;
  markersGrid[2] = centerMarker;

  console.log(centerGrid);
  console.log(topGrid);
}



function Mydistance(ID1, ID2){
  var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(markers[ID1].getPosition(), markers[ID2].getPosition());

  console.log("Distance: ", (distanceInMeters * 0.001));
  
  return distanceInMeters * 0.001;
}



function printDistance(ID, distance, distancex_y, run){
  var tbodyRef = document.getElementById('myOutput').getElementsByTagName('tbody')[0];
  // Insert a row at the end of table
  var newRow = tbodyRef.insertRow();

  // Insert cells at the end of the row
  var newCell1 = newRow.insertCell();
  var newCell2 = newRow.insertCell();
  var newCell3 = newRow.insertCell();

  // insert data to cells
  
  newCell1.innerHTML = "<td>" + ID + "</td>";
  newCell2.innerHTML = "<td>" + distance + "</td>";

  if(run == 1){
    newCell3.innerHTML = "<td>1-2: " + distancex_y + "</td>";
  }
  else if(run == 2){
    newCell3.innerHTML = "<td>1-2: " + distancex_y + "</td>";
  }
  else if(run == 3){
    newCell3.innerHTML = "<td>3-1: " + distancex_y + "</td>";
  }
  else{
    newCell3.innerHTML = "<td>" + distancex_y + "</td>";
  }
}

function deleteGridMarkers(){
  if(markersGrid[0] == undefined){
    return 0;
  }
  else{
    for (let i=0; i<markersGrid.length; i++) {
      markersGrid[i].setMap(null);
    }
    markersGrid = [];
  }
}

function calc(){
  deleteGridMarkers();

  var TableOutput = document.getElementById("tbodyOutput");
  TableOutput.innerHTML = "";
  
  var rowCount = document.getElementById('mySection').rows.length;
  
  if (rowCount != 4){
    document.getElementById("error_code_less").style.display = "block";
    return;
  }
  else if (rowCount == 4){
    document.getElementById("error_code_less").style.display = "none";
  }

  var td1 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[4].getElementsByTagName("input")[0].value;
  var td2 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[10].getElementsByTagName("input")[0].value;
  var td3 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[16].getElementsByTagName("input")[0].value;

  var id1 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[0].getElementsByTagName("input")[0].value;
  var id2 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[6].getElementsByTagName("input")[0].value;
  var id3 = document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[12].getElementsByTagName("input")[0].value;

  var lat0 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[1].getElementsByTagName("input")[0].value);
  var lat1 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[7].getElementsByTagName("input")[0].value);
  var lat2 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[13].getElementsByTagName("input")[0].value);

  var lng0 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[2].getElementsByTagName("input")[0].value);
  var lng1 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[8].getElementsByTagName("input")[0].value);
  var lng2 = parseFloat(document.getElementsByTagName('tbody')[0].getElementsByTagName("td")[14].getElementsByTagName("input")[0].value);


  var pos0 = {lat: lat0, lng: lng0}; 
  var pos1 = {lat: lat1, lng: lng1}; 
  var pos2 = {lat: lat2, lng: lng2}; 

  var distance0 = td1 * 12;
  var distance1 = td2 * 12;
  var distance2 = td3 * 12;

  var distance0_1 = Mydistance(0, 1); 
  var distance1_2 = Mydistance(1, 2); 
  var distance2_0 = Mydistance(2, 0); 

  setGrid(pos0, pos1, pos2, distance0, distance1, distance2, distance0_1, distance1_2, distance2_0)

  printDistance(id1, distance0, distance0_1, 1);
  printDistance(id2, distance1, distance1_2, 2);
  printDistance(id3, distance2, distance2_0, 3);
  // gridSearch();
}

function refreshButton(ID){
  var ele = document.getElementById("tbody").getElementById(ID).value;
  console.log(ele);
}

function DeleteMarker(id) {
  //Find and remove the marker from the Array
  for (var i = 0; i < markers.length; i++) {
      if (markers[i].id == id) {
          //Remove the marker from Map                  
          markers[i].setMap(null);

          //Remove the marker from array.
          markers.splice(i, 1);
          // console.log(id);
      }
  }
  // console.log(id);
  var row = document.getElementById(id);
  row.parentNode.removeChild(row);

  if(markers.length == 3){
    console.log("error")
    document.getElementById("error_code_much").style.display = "block";
    return;
  }
  else{
    document.getElementById("error_code_much").style.display = "none";
  }
}


function initMap() {
  // create map=map with fixed position=position
  const position = {lat: 50.59679995890105, lng: 10.679060321624725};

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: position,
    mapId: "4504f8b37365c3d0",
  });

  google.maps.event.addListener(map, 'click', function (e) {
    
    if(markers.length == 3){
      console.log("error")
      document.getElementById("error_code_much").style.display = "block";
      return;
    }
    else{
      document.getElementById("error_code_much").style.display = "none";
    }
    //Determine the location where the user has clicked.
    var location = e.latLng;

    //Create a marker and placed it on the map.
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });

    //Set unique id
    marker.id = uniqueID;
    // console.log(marker.id)

    // console.log(location);
    createMarker(marker.id, location, marker, uniqueID, location)

    //Add marker to the array.
    markers.push(marker);
    uniqueID++;

    // console.log(markers.length);
  });

  // Add a button to reset map.
  const controlDiv = document.createElement("div");
  const controlUI = document.createElement("button");

  controlUI.classList.add("ui-button");
  controlUI.innerText = "Reset map";
  controlUI.addEventListener("click", () => {
    // Reset map/ delete buttons
    resetMap();
  });
  controlDiv.appendChild(controlUI);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);    
}

function createMarkerModel(mytitle, uniqueID){
  // div.innerHTML = "<tr>   <td><input value='123'></td>    <td><input value='jafh'></td>   <td><input value='asf'></td>    <td><input value='information'></td>    <td>text</td>   </tr>";

  lat = mytitle.split(",")[0]
  lat = lat.split(" ")[1]
  long = mytitle.split(",")[1]
  long = long.split(" ")[1];

  // tbodyRef takes Element of mySection.tbody
  var tbodyRef = document.getElementById('mySection').getElementsByTagName('tbody')[0];
  // Insert a row at the end of table
  var newRow = tbodyRef.insertRow();
  newRow.id = uniqueID;
  // console.log(newRow.id);

  // Insert cells at the end of the row
  var newCell1 = newRow.insertCell();
  var newCell2 = newRow.insertCell();
  var newCell3 = newRow.insertCell();
  var newCell4 = newRow.insertCell();
  var newCell5 = newRow.insertCell();
  var newCell6 = newRow.insertCell();

  // insert data to cells
  newCell1.innerHTML = "<td><input value='" + uniqueID + "'></td>";
  newCell2.innerHTML = "<td><input value='" + lat + "'></td>"; 
  newCell3.innerHTML = "<td><input value='" + long + "'></td>";
  newCell4.innerHTML = "<td><input value='myname'></td>"; 
  newCell5.innerHTML = "<td><input value='0'></td>"; 
  newCell6.innerHTML = "<button onclick=DeleteMarker(" + uniqueID + ") style='border-color:red; font-size:80%'>delete</button>";

  var input = document.getElementById(newRow.id);

  // input.addEventListener("input", refreshButton(newRow.id));
}

function createMarker(markerid, location, marker, uniqueID, myLatLng){ // myLatLng, map
  // cord is array which contains latitude/longitude
  let cord = JSON.stringify(myLatLng.toJSON(), null, 2);

  // set lat to latitude of Marker. set long to longitude of Marker
  var lat = cord.split(" ")[3];
  var long = cord.split(" ")[6];
  long = long.split("}")[0];
  
  // console.log(lat, long);

  mytitle = "lat: "+ lat+ "long: "+ long;

  //Attach click event handler to the marker.
  google.maps.event.addListener(marker, "click", function (e) {
    // create Marker with content = lat+long + delete button -> DeleteMarker()
    
    var content = 'Latitude: ' + location.lat() + '<br />Longitude: ' + location.lng();
    content += "<br /><input type = 'button' va;ue = 'Delete' onclick = 'DeleteMarker(" + markerid + ");' value = 'Delete' />";
    
    // infoWindow is opened onclick of Marker -> contains content
    var infoWindow = new google.maps.InfoWindow({
        content: content
    });
    infoWindow.open(map, marker);
  });

  createMarkerModel(mytitle, uniqueID);
}

function createTestMarker(location, bool){ // myLatLng, map
  var marker = new google.maps.Marker({ position: location, map: map, title:"Epicenter"});
  
  markersTest[0] = marker;

  if (bool == true){
    map.setCenter(location);
    map.setZoom(8);

    markersGrid.push(marker);
  }
}

function resetMap() {
  // Reset the map
  const mapContainer = document.getElementById("mapContainer");
  const map = document.getElementById("map");

  map.remove();
  uniqueID = 1;
  IDCounter = 1;

  const mapDiv = document.createElement("div");

  mapDiv.id = "map";
  mapDiv.style = "height:75%; width:85%"
  mapContainer.appendChild(mapDiv);
  initMap();
  console.log("reset map");

  markers = [];
  document.getElementById("error_code_much").style.display = "none";
  document.getElementById("error_code_less").style.display = "none";

  var TableSection = document.getElementById("tbody");
  TableSection.innerHTML = "";

  var TableOutput = document.getElementById("tbodyOutput");
  TableOutput.innerHTML = "";
}

window.initMap = initMap;