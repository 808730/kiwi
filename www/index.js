$( document ).ready(function() {
	
	//Hintergrundkarten definieren
	var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png' , {
	maxZoom: 18,
	<!-- minZoom: 2, -->
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+' <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Data &copy 2017 LINZ'});
	
	
	var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
	});
	
	var ESRI_Satellite = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 18,
	<!-- minZoom: 2, -->
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community, Data &copy 2017 LINZ'});
	
	var Mapbox_Outdoor = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiODA4NzMwIiwiYSI6IjY0OW5LS0EifQ.o5wFCjlclI77_eXP7lIWLA' , {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery <a href="http://mapbox.com">Mapbox</a>'});
	
	//LatLngBounds
	var myBounds = L.latLngBounds([-90,220],[90,-150]);
		
	//Variable meineKarte als Leaflet-Karte definieren mit Ausgangsposition und Zoom
	//Hintergrundkarten in eigene Karten hinzufügen als Layer
	var meineKarte = L.map('map1', {
			center: [-41, 174],
			zoom: 6,
			minZoom: 2,
			maxZoom: 18,
			maxBounds: myBounds,
			zoomControl: false,
			layers: [OSM, Stamen_Terrain, ESRI_Satellite, Mapbox_Outdoor]
		});
	
	//Variable für Hintergrundkarten anlegen
	var baseLayers = { "OpenStreetMap": OSM, "Terrain": Stamen_Terrain, "Satellitenbild": ESRI_Satellite, "Outdoor": Mapbox_Outdoor};
		
	// Proxy festlegen
	var proxy = 'proxy.php';
		
	// AJAX - API Campsites Layer einbinden
	function loadAjax1() {
		return $.ajax({
		  method: "GET",
		  dataType: 'json',
		  url: proxy,
		  data: {
		  'url' : 'https://api.doc.govt.nz/v1/campsites'
		  },
		  success: function(data, success) {
			var data = jQuery.parseJSON(data);
			console.log("AJAX Campsites loaded and ready to go");
			campsitesdata = data;
		  },
		  error: function(jqxhr, textStatus, error) {
			console.log("error", arguments);
		  }
		  
		});
	}
		
	// AJAX - API Huts Layer einbinden
	function loadAjax2() {
		return $.ajax({
		  method: "GET",
		  dataType: 'json',
		  url: proxy,
		  data: {
		  'url' : 'https://api.doc.govt.nz/v1/huts'
		  },
		  success: function(data, success) {
			var data = jQuery.parseJSON(data);
			console.log("AJAX Huts loaded and ready to go");
			hutsdata = data;
		  },
		  error: function(jqxhr, textStatus, error) {
			console.log("error", arguments);
		  }
		  
		});
	}
		
	// Campsites holen START
	// Lege neues Array "jsonArrayCS" für Campsites an
	var jsonArrayCS = [];


	// For Schleife, nimmt Elemente aus JSON und schreibt sie in Variablen, am Ende pusht sie alles in das neue jsonArrayCS
	function getCampsites() {
		for (var i=0; i < campsitesdata.length; i++) {
			var AssetId = campsitesdata[i].AssetId;
			var Name = campsitesdata[i].Name;
			var Status = campsitesdata[i].Status;
			var Locations = campsitesdata[i].Locations;
			var x = campsitesdata[i].x;
			var y = campsitesdata[i].y;
			
			var coord = [x, y]
			
			// Projektionen als String in Variablen schreiben, um sie unten zu verwenden
			var proj2193 = 'PROJCS["NZGD2000 / New Zealand Transverse Mercator 2000",GEOGCS["NZGD2000",DATUM["New_Zealand_Geodetic_Datum_2000",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6167"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4167"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",173],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",1600000],PARAMETER["false_northing",10000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","2193"]]'
			var proj4326 = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
			
			// Die Koordinaten umprojizieren nach folgendem Schema
			//var projcoord = proj4(fromProjection[, toProjection, coordinates])	
			var projcoord = proj4(proj2193,proj4326,coord)
			
			// leeres JSON schreiben
			var obj = {"type": "Feature", "properties": { "AssetId": "", "Name": "", "Status": "", "Locations": [] }, "geometry": { "type": "Point", "coordinates": [] } }

			//Variablen von oben in das zuvor erzeugte JSON "obj" schreiben
			obj.properties.AssetId = AssetId
			obj.properties.Name = Name
			obj.properties.Status = Status
			obj.properties.Locations = Locations
			obj.geometry.coordinates = projcoord
			
			// Das JSON "obj" in das jsonArrayCS schreiben
			jsonArrayCS.push(obj);
		};

		//Koordinaten-Nullwerte aus jsonArrayCS rausfiltern
		for (var u=0; u < jsonArrayCS.length; u++) {
			if (jsonArrayCS[u].geometry.coordinates[0] == 0 ) {
				delete jsonArrayCS[u];
			}
		};

		//Filter, filtert "undefined" Werte aus dem Array, welche durch Objektlücken entstanden sind
		jsonArrayCS = jsonArrayCS.filter( Boolean );

		// campsitesgeoJSON schreiben (leer)
		campsitesgeoJSON = {
		"type": "FeatureCollection",
		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
		"features": [] }

		//campsitesJSON mit jsonArrayCS füllen
		campsitesgeoJSON.features = jsonArrayCS;
	}
	// Campsites holen ENDE
	
	// Ladeanimation startet
	meineKarte.spin(true);
		
	
	// Huts holen START
	// Lege neues Array "jsonArrayHT" für Huts an
	var jsonArrayHT = [];


	// For Schleife, nimmt Elemente aus JSON und schreibt sie in Variablen, am Ende pusht sie alles in das neue jsonArrayHT
	function getHuts() {
		for (var i=0; i < hutsdata.length; i++) {
			var AssetId = hutsdata[i].AssetId;
			var Name = hutsdata[i].Name;
			var Status = hutsdata[i].Status;
			var Region = hutsdata[i].Region;
			var x = hutsdata[i].x;
			var y = hutsdata[i].y;
			
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
			
			// Das JSON "obj" in das jsonArrayHT schreiben
			jsonArrayHT.push(obj);
		};

		//Koordinaten-Nullwerte aus jsonArrayHT rausfiltern
		for (var u=0; u < jsonArrayHT.length; u++) {
			if (jsonArrayHT[u].geometry.coordinates[0] == 0 ) {
				delete jsonArrayHT[u];
			}
		};

		//Filter, filtert "undefined" Werte aus dem Array, welche durch Objektlücken entstanden sind
		jsonArrayHT = jsonArrayHT.filter( Boolean );

		// hutsgeoJSON schreiben
		hutsgeoJSON = {
		"type": "FeatureCollection",
		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
		"features": [] }

		//hutsgeoJSON mit jsonArray füllen
		hutsgeoJSON.features = jsonArrayHT;
	}
	// Huts holen ENDE
		
	// Dinge, die erst passieren sollen nachdem die API Daten geladen wurden
	function doAfterAjaxIsReady() {
		// Campsites Layer
		Campsites = new L.GeoJSON(campsitesgeoJSON, {
			onEachFeature: function onEachFeature(feature, layer) {
				var fixedCoord = (feature.geometry.coordinates);
				layer.bindPopup('<b>' + feature.properties.Name + '</b>' + '<br>' +
								'Status: ' + feature.properties.Status + '<br>' +
								'Location: ' + feature.properties.Locations + '<br>' +
								'Coordinates: ' + feature.geometry.coordinates[0].toFixed(6)
								+ ', ' + feature.geometry.coordinates[1].toFixed(6)
				)
			}
		});
		// Huts Layer
		Huts = new L.GeoJSON(hutsgeoJSON, {
			onEachFeature: function onEachFeature(feature, layer) {
				layer.bindPopup('<b>' + feature.properties.Name + '</b>' + '<br>' +
								'Status: ' + feature.properties.Status + '<br>' +
								'Region: ' + feature.properties.Region + '<br>' +
								'Coordinates: ' + feature.geometry.coordinates[0].toFixed(6)
								+ ', ' + feature.geometry.coordinates[1].toFixed(6)
				)
			}
		});
		
		// Layer Gruppieren

		// MarkerCluster für Campsites
		var markersCampsites = L.markerClusterGroup();
		markersCampsites.addLayer(Campsites);
		var CampsitesGroup = L.layerGroup([markersCampsites]);
		// MarkerCluster für Huts
		var markersHuts = L.markerClusterGroup();
		markersHuts.addLayer(Huts);
		var HutsGroup = L.layerGroup([markersHuts]);
		//Variable für Overlays anlegen
		overlays = {"TracksWFS": geojsonLayer, "Campsites (API)": CampsitesGroup, "Huts (API)": HutsGroup};
		L.control.layers(baseLayers, overlays).addTo(meineKarte);
		//Ladeanimation beenden
		meineKarte.spin(false);
	};
	
	//Festlegen zu welchem Zeitpunkt welche Funktion ausgeführt werden soll
	$.when(loadAjax1(),loadAjax2()).done(getCampsites, getHuts, doAfterAjaxIsReady);	
	
	var highlight = {
    'color': 'yellow',
    'weight': 2,
    'opacity': 1
};

	var notHighlight = {
    'color': 'blue',
    'weight': 2,
    'opacity': 1
};
		var lastClicked = false;
		
		function onEachFeature(feature, layer) {
						
			// OnClick
			layer.on('click', function (e) {
						meineKarte.setView(e.latlng, 11);
							layer.setStyle(highlight);
							layer.bindPopup('Das Höhenprofil erscheint oben!');
								if (lastClicked) {
									lastClicked.setStyle(notHighlight);
										}
								lastClicked = layer;
					   // Länge, Punkteanzahl, Punkteabstand von Track in Variablen schreiben
                        var laengekm = (feature.properties.Shape_Leng/1000).toFixed(2);
						var punkteanzahl = feature.geometry.coordinates[0].length
						var punkteabstandFixed = (laengekm/punkteanzahl).toFixed(2);
                        // Arrays mit x (Längenwerte) und y (Höhenwerte) anlegen
                        xWerteArray = ['x'];
                        yWerteArray = ['Höhe (m)'];
                        // alle jeweiligen Längen- & Höhenwerte des Tracks in obige Arrays schreiben
						for (var t=0; t < feature.geometry.coordinates[0].length; t++) {
							var featurePointDistance = (punkteabstandFixed * t).toFixed(2);
							var featureZvalue = feature.geometry.coordinates[0][t][2];
							xWerteArray.push(featurePointDistance);
							yWerteArray.push(featureZvalue);
						}
						
						//Slide-Down Animation
						$("#elevation-div").slideDown(2000);
						
                        // Diagramm aus den Arrays generieren
						chart = c3.generate({
							transition: {
							  duration: 0
							},
                            bindto: '#chart-div',
                            point: {show: false},
                            data: {
                                x: 'x',
                                columns: [
                                    xWerteArray, yWerteArray
                                ],
                                type: 'spline'
                            },
							legend: {show: false}, 
							color: { pattern: ['#FF4800'] },
							padding: {
								left: 50,
								right: 20,
								top: 20,
							},
							tooltip: {
								format: {
									title: function (x) { return 'Kilometer ' + x;}
								}
							},
                            size: {height: 300},
                            axis: {
                                x: {
                                    padding: {
                                        left: 0,
                                        right: 0,
                                    },
                                    label: "Kilometer",
                                    tick: {
                                        count: 41,
                                        fit: true,
                                        culling: {
                                            max: 11
                                        },
                                        format: d3.format('.2f')	
                                    }
                                },
                                y: {
                                    label: {text: "Höhe in m",
									position: "inner-middle"}
                                }
                            }
                        });
                    }
                )
        }
	
	$.ajax({
		  url: "http://192.168.178.200/geoserver/kurs1034/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=kurs1034:tracks3D_5dec_space&maxFeatures=5000&outputFormat=application%2Fjson&format_options=callback:getJson",
          dataType: 'json',
          jsonCallback: 'getJson',
          success: loadGeojson
		});
		
		
		geojsonLayer = '';
		
		function loadGeojson(data) {
			geojsonLayer = L.geoJson(data, {onEachFeature: onEachFeature}); 
          
		  console.log("WFS-Dienst geladen!");
		
		};
		
				
    //});
	
	//Funktionen für Close-Button in Elevation-Div
	$("#close-x").mouseenter(function(){
        $("#close-x").css("opacity", "1.0");
    }).mouseleave(function(){
		$("#close-x").css("opacity", "0.4")});
	
	$("#close-x").click(function(){
		$("#elevation-div").slideUp(2000);
	});
	
	//Funktionen für Map-Buttons 
		$('#button1').click(function() {
			$('#lat').val( Math.round(meineKarte.getCenter().lat*10000) / 10000);
			$('#lng').val( Math.round(meineKarte.getCenter().lng*10000) / 10000);
			});
			
		$('#button2').click(function() {
			$('#zoom').val(meineKarte.getZoom());
			});
	
	//Standort-Funktion
		$('#standortBtn').click(function() {
			function onLocationFound(e) {
				var radius = parseInt(e.accuracy/2);
		
			L.marker(e.latlng).addTo(meineKarte)
				.bindPopup("Du bist " + radius + " Meter von diesem Punkt entfernt.").openPopup();
			L.circle(e.latlng, radius).addTo(meineKarte);
			}
			meineKarte.on('locationfound', onLocationFound);
			meineKarte.locate({setView: true, maxZoom: 16});	
			});
			
	//Maus&Map_Events
	
	function onMapMousemove(e) {
		lat = e.latlng.lat;
		lon = e.latlng.lng;
		$('#LiveLatLon').val(lat);
		$('#LiveLatLon1').val(lon);
	};
	meineKarte.on('mousemove', onMapMousemove); 
		
	//beim Verändern der Kartengröße Karte neu skalieren und eine Nachricht ausgeben in der Konsole
	meineKarte.on('resize', function(e) {
		alert('Karte angepasst');
	});
	//beim Verschieben der Karte das aktuelle Kartenzentrum und den aktuellen Zoom ausgeben 
	meineKarte.on('moveend', function(e) {
		$('#lat').val('' + meineKarte.getCenter().lat);
		$('#lng').val('' + meineKarte.getCenter().lng);
		$('#zoom').html('Zoomstufe: ' + meineKarte.getZoom());
	});
	//Beim Rein/Raus-Zoomen den neuen Zoom angeben
	meineKarte.on('zoomend', function(e) {
		$('#zoom').val(meineKarte.getZoom());
	});

	var zoomHome = L.Control.zoomHome({zoomHomeTitle: 'ZoomHome'});
	zoomHome.addTo(meineKarte);
	L.Control.geocoder().addTo(meineKarte);
	
	L.control.scale().addTo(meineKarte);
});