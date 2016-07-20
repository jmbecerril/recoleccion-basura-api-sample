// Ajax request
function ajaxRequestjson(_url, callback){
	$.ajax({
        type: 'GET',
        async:true,
        url: _url,
        dataType : 'json',
        success: function (data){
        	callback(data);
        }
    });
}

// Create Marker
function createMarker(lat, lng, title, alt, icon){
	var marker = L.marker([lng,lat], { title: title, alt: alt, icon: icon });
	return marker
}

// Add popUp to Layer
function addPopupLayer(popUpContent, layer){
	var customOptions = {
    	'className' : 'custom-popup'
    };
	layer.bindPopup(popUpContent, customOptions);
}

// Create Icon
function createIcon(iconUrl, iconSize, popupAnchor){
	var icon = L.icon({
		iconUrl: iconUrl,
	 	iconSize: iconSize, // size of the icon
	  	popupAnchor: popupAnchor
	});
	return icon;
}

// Create DivIcon
function createDivIcon(html, className, iconSize){
	var divIcon = L.divIcon({ 
		html: html, //html content inside cluster
		className: className, //className for cluster container
		iconSize: iconSize //size for cluster container
	});
	return divIcon;
}

// Create markerClusterGroup
function createmarkerClusterGroup(clusterCfg){
	var markers = L.markerClusterGroup(clusterCfg);
	return markers;
}

// Add marker to cluster
function addMarkerCluster(markerClusterGroup, marker){
	return markerClusterGroup.addLayer(marker);
}

//Add Layer to Map
function addLayerToMap(map, layer){
	return map.addLayer(layer);
}

// Config Map
var options = {
	style              : "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
	center             : [19.544723, -96.891818],
	zoom               : 13,
	zoomControl        : true,
	holder             : 'map',
	maxZoom            : 23
};
options.layers = L.tileLayer( options.style, {
	attribution  : 'Recolección de Basura, 2016',
});

// Create Map 
var map = L.map( options.holder, options );

// Trucks
function trucks(){

	// url API
	var url = "http://recoleccionbasura.xalapa.gob.mx/api/v1/gruposVehiculo"+
	"/1bca1382-b20f-442b-8c68-be29d51ff0f7/ultimasPosicionesVehiculos";

	// Invoke ajax request
	ajaxRequestjson(url, function(output){

		// Response
		var items = output.Items;

		// Cluster Configuration
		var clusterCfg = {
	        showCoverageOnHover: false,
	        zoomToBoundsOnClick: true,
	        removeOutsideVisibleBounds: true,
	        maxClusterRadius: 60,
	        disableClusteringAtZoom: 15,
	        chunkedLoading: true,
	        iconCreateFunction: function (cluster) {
	          var markers = cluster.getAllChildMarkers(); 
	          var number = markers.length; 
	          var html = '<div class="counter-cluster counter-trucks">' + number + '</div>';
	          var divIcon = createDivIcon(html, 'leaflet-div-icon-truck', L.point(40, 70));
	          return divIcon;
	        }
	    };

	    // Cluster Group
		var markers =  createmarkerClusterGroup(clusterCfg);

		$.each(items, function (i, item){

			// Icon
			var icon, iconUrl, iconSize, popupAnchor;
			iconUrl = "libs/images/truck.png";
			iconSize = [30, 30];
			popupAnchor = [0,-15];
			icon = createIcon(iconUrl, iconSize, popupAnchor);
			
			// Maker
			var coords = item.Position;
			var lat = coords[0];
			var lng = coords[1];
			var alt = item.Description;
			var title = alt;
			var marker = createMarker(lat, lng, title, alt, icon);

			// popUp content to Marker
			var popUpContent = "";
			var unit = item.Description;
			var location = item.Location;
			popUpContent += "<h5>"+unit+"</h5>";
          	popUpContent += "<ul>";
          	popUpContent += "<li>Ubicación: "+location+"</li>";
          	popUpContent += "</ul>";

          	// Add popUp to Marker
			addPopupLayer(popUpContent, marker);

			// Add maker to Cluster
			addMarkerCluster(markers, marker);
		});

		// Add cluster to map
		addLayerToMap(map, markers);

		// hide loading
		$('.layer-map').removeClass('show');
	});
}

// show loading
$('.layer-map').addClass('show');

// execute action
setTimeout(function(){
	trucks();
}, 3000);