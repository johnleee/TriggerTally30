
//Author: Abhishek Shiroor

function initTapTap() {
    var touchzone = document.getElementById("shotcanvas");
    touchzone.width = window.innerWidth;
    touchzone.height = window.innerHeight;
    touchzone.style.padding = "0px";
    touchzone.style.margin = "0px";
    touchzone.addEventListener("touchstart", drawByTap, false);

}

function drawByTap() {
    var canvas = document.getElementById('shotcanvas');
    if(canvas.getContext) {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(event.touches[0].pageX, event.touches[0].pageY, 5, 0, 2 * Math.PI, false);
        context.lineWidth = 4;
        context.strokeStyle = '#990000';
        context.stroke();
        
    }
}

function loadTapToMark() {
    captureTapPhotoEdit();
    $.mobile.navigate( "#taptomark" );
}


// A button will call this function
function captureTapPhotoEdit() {
    // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
    navigator.camera.getPicture(onTapPhotoURISuccess, onFail, { quality: 20, allowEdit: true,
                                destinationType: destinationType.FILE_URI });
}



// Called when a tap photo is successfully retrieved
function onTapPhotoURISuccess(imageURI) {
    // Uncomment to view the image file URI
    console.log(imageURI);
    var canvas = document.getElementById('shotcanvas');
    var context = canvas.getContext('2d');
    var x = 0;
    var y = 0;
    var width = canvas.width
    var height = canvas.height
    
    var imageObj = new Image();
    
    imageObj.onload = function() {
        context.drawImage(imageObj, x, y, width, height);
    };
    imageObj.src = imageURI;
}

