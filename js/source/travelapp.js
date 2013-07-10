
var homeLocation = {

	get: function() {
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


function toRad(Value) {
	/** Converts numeric degrees to radians */
	return Value * Math.PI / 180;
}



var locationPage = {

	getLocation: function(){
		console.log("locationPage.getLocation Fired");
		navigator.geolocation.getCurrentPosition(this.getLocationSuccess,this.getError);
	},

	getLocationSuccess: function(position){
		console.log("locationPage.getLocationSuccess Fired");
		$("#lat").html(position.coords.latitude);
		$("#lon").html(position.coords.longitude);
		console.log(this);
		locationPage.doReverseLookup(position);
    },

    getError: function(error){
		console.log("getError Fired");
		console.log(error);
    },

    doReverseLookup: function(position) {
      console.log("locationPage.doReverseLookup Fired");
      var latlon = position.coords.latitude + "," + position.coords.longitude;

      $.ajax({
          url: "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=" + latlon,
          success: locationPage.doReverseLookupSuccess
        });
    },

    doReverseLookupSuccess: function(response) {
      console.log("locationPage.doReverseLookupSuccess Fired");
      console.log(response);
      var addressObj = response.results[0];
      $("#address").html(addressObj.formatted_address);
    }


};

var distancePage = {
	setDistanceReadout: function(d_km, d_miles){
		$("#d_km").html(d_km);
		$("#d_miles").html(d_miles);
	},

	setDevicePosition: function (lat,lon) {
		$("#lat-device").html(lat);
		$("#lon-device").html(lon);
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

      distancePage.setDevicePosition(lat_device, lon_device);

      console.log("lat_device:",lat_device);
      console.log("lon_device:",lon_device);
      console.log("lat_home:",lat_home);
      console.log("lon_home:",lon_home);

      var distanceKM = Math.round(distanceModule.calcDistanceBetween(lat_device, lon_device,lat_home, lon_home));
      var distanceMiles = Math.round(distanceModule.calcDistanceBetween(lat_device, lon_device,lat_home, lon_home, "miles"));
      
      distancePage.setDistanceReadout(distanceKM, distanceMiles);
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

		var dLat = toRad(lat2-lat1);
		var dLon = toRad(lon2-lon1);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		return d;
	}

	
};


