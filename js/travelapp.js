function getHomeLocation() {
  var results = {};
  results.lat = localStorage.getItem('lat');
  results.lon = localStorage.getItem('lon');
  return results;
}


function toRad(Value) {
	/** Converts numeric degrees to radians */
	return Value * Math.PI / 180;
}

function calcDistanceBetween(lat1, lon1, lat2, lon2, units) {
	if (typeof(units) == "undefined") units = "km";

	var R = 6371; // Radius of earth in km 
	if (units == "miles"){
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