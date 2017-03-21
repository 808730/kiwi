// Test JSON (so sieht das JSON von der API aus)
var data = [
  {
    "AssetId": 100075587,
    "Name": "Doubtless Hut",
    "Status": "OPEN",
    "Region": "Canterbury",
    "x": 1536447,
    "y": 5291972
  },
  {
    "AssetId": 100055177,
    "Name": "Makino Hut",
    "Status": "OPEN",
    "Region": "Hawke's Bay",
    "x": 1894320,
    "y": 5656637
  },
  {
    "AssetId": 100055187,
    "Name": "Test Hut",
    "Status": "OPEN",
    "Region": "Test Region",
    "x": null,
    "y": null
  }
]

// Lege neues Array "jsonArray" an
var jsonArray = [];

// For Schleife, nimmt Elemente aus JSON und schreibt sie in Variablen, am Ende pusht sie alles in das neue jsonArray
for (i=0; i < data.length; i++) {
	var AssetId = data[i].AssetId;
	var Name = data[i].Name;
	var Status = data[i].Status;
	var Region = data[i].Region;
	var x = data[i].x;
	var y = data[i].y;
	
	var coord = [x, y]
	
	// Projektionen als String in Variablen schreiben, um sie unten zu verwenden
	var proj2193 = 'PROJCS["NZGD2000 / New Zealand Transverse Mercator 2000",GEOGCS["NZGD2000",DATUM["New_Zealand_Geodetic_Datum_2000",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6167"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4167"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",173],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",1600000],PARAMETER["false_northing",10000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","2193"]]'
	var proj4326 = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
	
	// Die Koordinaten umprojizieren nach folgendem Schema
	//var projcoord = proj4(fromProjection[, toProjection, coordinates])	
	var projcoord = proj4(proj2193,proj4326,coord)
	
	// leeres JSON schreiben
	var obj = {"type": "Feature", "properties": { "AssetId": "", "Name": "", "Status": "", "Region": "" }, "geometry": { "type": "Point", "coordinates": [] } }

	//Variablen von oben in das zuvor erzeugte JSON "obj" schreiben
	obj.properties.AssetId = AssetId
	obj.properties.Name = Name
	obj.properties.Status = Status
	obj.properties.Region = Region
	obj.geometry.coordinates = projcoord
	
	// Das JSON "obj" in das jsonArray schreiben
	jsonArray.push(obj);
	
};

//Koordinaten-Nullwerte aus jsonArray rausfiltern
for (u=0; u < jsonArray.length; u++) {
	if (jsonArray[u].geometry.coordinates[0] == 0 ) {
		delete jsonArray[u];
	}
};

//Filter, filtert "undefined" Werte aus dem Array, welche durch Objektlücken entstanden sind
jsonArray = jsonArray.filter( Boolean );

// hutsgeoJSON schreiben
var hutsgeoJSON = {
"type": "FeatureCollection",
"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
"features": [] }

//hutsgeoJSON mit jsonArray füllen
hutsgeoJSON.features = jsonArray;