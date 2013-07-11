var googleMapsURL = "https://maps.googleapis.com/maps/api/geocode/json";
var homeLocation = {

	get: function () {
		var results = {};
		results.lat = localStorage.getItem('lat');
		results.lon = localStorage.getItem('lon');
		return results;
	},
	set: function(lat,lon) {
        localStorage.setItem('lat', lat);
        localStorage.setItem('lon', lon);
    }

};

function Address(street,city,state,zip) {
	this.street = street;
	this.city = city;
	this.state = state;
	this.zip = zip;
	
	function getFormatted() {
		return this.street + ' ' + this.city + ' ' + this.state + ' ' + this.zip;
	}
	this.getFormatted = getFormatted;
}

var ajax = {
	xmlhttp: new XMLHttpRequest(),
	callback: "",
	onReadyChangeState: function(){
		console.log("ajax.onReadyChangeState fired");
		if (ajax.xmlhttp.readyState === 4 && ajax.xmlhttp.status === 200){
			ajax.callback(JSON.parse(ajax.xmlhttp.responseText));
		}
	},
	get: function(url, successCallback){
		console.log("ajax.get fired");
		ajax.callback = successCallback;
		ajax.xmlhttp.onreadystatechange = ajax.onReadyChangeState;
		ajax.xmlhttp.open("GET",url,true);
		ajax.xmlhttp.send();
		ajax.xmlhttp.setRequestHeader();
	}
};



var locationInterface = {

	getLocation: function(){
		console.log("locationInterface.getLocation Fired");
		navigator.geolocation.getCurrentPosition(this.getLocationSuccess,this.getError);
	},

	getLocationSuccess: function(position){
		console.log("locationInterface.getLocationSuccess Fired");
		document.querySelector("#lat").innerHTML = position.coords.latitude;
		document.querySelector("#lon").innerHTML = position.coords.longitude;
		console.log(this);
		locationInterface.doReverseLookup(position);
    },

    getError: function(error){
		console.log("getError Fired");
		console.log(error);
    },

    doReverseLookup: function(position) {
      console.log("locationInterface.doReverseLookup Fired");
      var latlon = position.coords.latitude + "," + position.coords.longitude;

      ajax.get(googleMapsURL + "?sensor=false&latlng=" + latlon, locationInterface.doReverseLookupSuccess);
    },

    doReverseLookupSuccess: function(response) {
      console.log("locationInterface.doReverseLookupSuccess Fired");
      var addressObj = response.results[0];
      document.querySelector("#address").innerHTML = addressObj.formatted_address;
    }
};


var distanceInterface = {
	setDistanceReadout: function(d_km, d_miles){
		document.querySelector("#d_km").innerHTML = d_km;
		document.querySelector("#d_miles").innerHTML = d_miles;
	},

	setDevicePosition: function (lat,lon) {
		document.querySelector("#lat-device").innerHTML = lat;
		document.querySelector("#lon-device").innerHTML = lon;
	}

};

var settingsInterface = {
	reportHomeLocation: function(lat,lon) {
		document.querySelector("#lat").innerHTML = lat;
		document.querySelector("#lon").innerHTML = lon;
    },

    getAddress: function() {
		var formInput = new Address();
		formInput.street =  document.querySelector("#address").value;
		formInput.city =  document.querySelector("#city").value;
		formInput.state =  document.querySelector("#state").value;
		formInput.zip =  document.querySelector("#zip").value;
		return formInput;
    }

};

var pictureInterface = {
	displayImage: function(imagePath){
      var result = document.getElementById("latest");
      result.src = imagePath;
      result.style.display="inline";
	}
};

var compassInterface = {

	rotateCompass: function(numberToTravelTo){
		var compass =  document.querySelector('#compass');
        compass.style.webkitTransform = "rotate(" + numberToTravelTo + "deg)";
	}
};



var distanceModule = {
	
	getLocation: function() {
      navigator.geolocation.getCurrentPosition(distanceModule.getLocationSuccess,distanceModule.getLocationError);
      console.log("getLocation Fired");
    },

    getLocationError: function(error) {
      console.log("getLocationError Fired");
      console.log(error);
    },

    getLocationSuccess: function(position) {
      var lat_device = position.coords.latitude;
      var lon_device = position.coords.longitude;
      var home = homeLocation.get();
      var lat_home = home.lat;
      var lon_home = home.lon;

      distanceInterface.setDevicePosition(lat_device, lon_device);

      console.log("lat_device:",lat_device);
      console.log("lon_device:",lon_device);
      console.log("lat_home:",lat_home);
      console.log("lon_home:",lon_home);

      var distanceKM = Math.round(distanceModule.calcDistanceBetween(lat_device, lon_device,lat_home, lon_home));
      var distanceMiles = Math.round(distanceModule.calcDistanceBetween(lat_device, lon_device,lat_home, lon_home, "miles"));
      
      distanceInterface.setDistanceReadout(distanceKM, distanceMiles);
    },

    toRad: function (Value) {
		/** Converts numeric degrees to radians */
		return Value * Math.PI / 180;
	},

    calcDistanceBetween: function(lat1, lon1, lat2, lon2, units) {
		if (typeof(units) === "undefined") {
			units = "km";
		}

		var R = 6371; // Radius of earth in km 
		if (units === "miles"){
			R = 3958.7558657440545; // Radius of earth in miles 
		}

		//Radius of the earth in:  3958.7558657440545 miles,  6371 km  | var R = (6371 / 1.609344);

		var dLat = distanceModule.toRad(lat2-lat1);
		var dLon = distanceModule.toRad(lon2-lon1);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(distanceModule.toRad(lat1)) * Math.cos(distanceModule.toRad(lat2)) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		return d;
	}

	
};






var settings = {
	computeHomeLocation: function(e) {
		e.preventDefault();

		var address = settingsInterface.getAddress();

		ajax.get(googleMapsURL + "?sensor=false&address=" + address.getFormatted(), settings.doLookupSuccess);
	},

	setHomeLocationHere: function (e) {
		e.preventDefault();
		navigator.geolocation.getCurrentPosition(settings.getLocationSuccess,settings.getLocationError);
	},

	getLocationSuccess: function(position) {
		console.log("getLocationSuccess Fired");
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		homeLocation.set(lat,lon);
		settingsInterface.reportHomeLocation(lat,lon);
	},

	getLocationError: function(error) {
		console.log("getLocationError Fired");
		console.log(error);
	},


	doLookupSuccess: function(e) {
		console.log(e.results[0].geometry.location);
		var lat = e.results[0].geometry.location.lat;
		var lon = e.results[0].geometry.location.lng;
		homeLocation.set(lat,lon);
		settingsInterface.reportHomeLocation(lat,lon);
	}
};



var picture = {

	onError: function(error) {
		console.log(error.message);
	},

	getPicture: function(e){
		e.preventDefault();
		navigator.device.capture.captureImage(picture.onGetImageSuccess, picture.onError, {limit: 1});
	},

	onGetImageSuccess: function(imageInfo){
		var imagePath = imageInfo[0].fullPath;
		pictureInterface.displayImage(imagePath);
	}

};



var compass = {

	lastReading: 0,
    watchID: null,

	onError: function(error) {
      console.log(error.message);
    },

    startWatch: function() {
		var options = { frequency: 100 };
		compass.watchID = navigator.compass.watchHeading(compass.onSuccess, compass.onError, options);
    },

    stopWatch: function() {
        if (compass.watchID) {
            navigator.compass.clearWatch(compass.watchID);
            compass.watchID = null;
        }
    },

    onSuccess: function(heading) {
        var element = document.getElementById('heading');
        compass.changeHeading(heading.magneticHeading);
    },

    changeHeading: function(heading){
        var numberToTravelTo = heading;
        var delta = Math.abs(compass.lastReading - heading);
        console.log("numberToTravelTo: " + numberToTravelTo);
        console.log("delta: " + delta);

        if (delta > 2){
            if (delta > 180){
                numberToTravelTo = numberToTravelTo - 360;
            }
        
            compassInterface.rotateCompass(compass.flipSign(numberToTravelTo));
            compass.lastReading = numberToTravelTo;
        }
    },

    flipSign: function(number){
        return number * -1;
    }

};


