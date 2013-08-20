
// Wait for Cordova to load - for phonegap
document.addEventListener("deviceready", onDeviceReady, false);

//for testing on browser
//document.addEventListener("DOMContentLoaded", onDeviceReady, false);

//Create the database the parameters are 1. the database name 2.version number 
// 3. a description 4. the size of the database (in bytes) 5 * 1024 x 1024 = 5MB
var dbName = "ShotgunDatabase";
var dbVersion = "1.0";
var dbDesc = "Shotgun Database 1.0"
var dbSize = 5 * 1024 * 1024; 
var db;

//camera variables
var pictureSource;   // picture source
var destinationType; // sets the format of returned value 

// Populate the database 
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS SHOTS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS SHOTS (id INTEGER PRIMARY KEY ASC, x INTEGER, y INTEGER, distance INTEGER, author TEXT)');
}

// Query the database
function queryDB(tx) {
    tx.executeSql('SELECT * FROM SHOTS', [], querySuccess, errorCB);
}

// Query the success callback
function querySuccess(tx, results) {
    console.log("Returned rows = " + results.rows.length);
    for (i = 0; i < results.rows.length; i++) {
      //Get the current row
      var row = results.rows.item(i);
      console.log(row);
    }

    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
        console.log('No rows affected!');
        return false;
    }
    // for an insert statement, this property will return the ID of the last inserted row
    console.log("Last inserted row ID = " + results.insertId);
}

// Transaction error callback
function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
}

// Transaction success callback
function successCB() {
    db = window.openDatabase(dbName, dbVersion, dbDesc, dbSize);
    db.transaction(queryDB, errorCB);
}

// Cordova is ready
function onDeviceReady() {
    //set default camera variables
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;

    if (window.openDatabase) {
      var db = window.openDatabase(dbName, dbVersion, dbDesc, dbSize);
      db.transaction(populateDB, errorCB, successCB);
    } else {
        alert("WebSQL is not supported by this device");
    }
}

function addShot() {
    
    var y = $('#data-entry-vslider').val();
    var x = $('#data-entry-hslider').val();
    //var distance =  $('#distanceselect').val();
    var distance =  50;

    if (x !== "" && y !== "") {
        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO SHOTS (x, y, distance) VALUES (?, ?, ?)", [x, y, distance]);
        });
        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM SHOTS', [], querySuccess, errorCB);
        });
        //db.transaction(queryDB, errorCB);
    } else {
        showAlert("You must enter horizontal and vertical inches!", "Invalid", "Yes sir!");
    }
}

// Show a custom alert, only works in phonegap
function showAlert(message, title, buttonName) {
    console.log(navigator);
    navigator.notification.alert(
        message, 
        alertDismissed, // callback
        title,            
        buttonName
    );
}

// alert dialog dismissed
function alertDismissed() {
    // do something
}


//** START CAMERA JS
// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  //console.log(imageData);

  // Get image handle
  var smallImage = document.getElementById('targetImage');

  // Unhide image elements
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  console.log(imageURI);
  // Get image handle
  //
  var largeImage = document.getElementById('targetImage');

  // Unhide image elements
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  largeImage.src = imageURI;
}

// A button will call this function
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL });
}

// A button will call this function
function capturePhotoEdit() {
  // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 20, allowEdit: true,
    destinationType: destinationType.DATA_URL });
}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}

// Called if something bad happens.
// 
function onFail(message) {
  //alert('Failed because: ' + message);
}

//** END CAMERA JS    

//** START HEATMAP

function loadReports() {
  console.log("load reports");
  queryShotsForHeat();
  $.mobile.navigate( "#reports" );
}

function queryShotsForHeat(){
     db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM SHOTS', [], querySuccessForHeat, errorCB);
      });                    
}      

// Query the success callback
function querySuccessForHeat(tx, results) {
    console.log("Returned rows = " + results.rows.length);
    // Reading data
    var config = {
      "element": document.getElementById("heatmapArea"),
      "radius": 10,
      "opacity": 75,
      "visible": true
    };
                           
    var heatmap = h337.create(config);
    var heatmapdata = {max: 20,data: []};

    for (i = 0; i < results.rows.length; i++) {
      //Get the current row
      var row = results.rows.item(i);
      console.log(row);
      heatmapdata.data.push({
             "x": Number(row.x),
             "y": Number(row.y),
             "count": 20
      });
    }

    heatmap.store.setDataSet(heatmapdata);

    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
        console.log('No rows affected!');
        return false;
    }
    // for an insert statement, this property will return the ID of the last inserted row
    console.log("Last inserted row ID = " + results.insertId);
}                 
                           

//** END HEATMAP



