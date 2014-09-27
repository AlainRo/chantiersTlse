// perceptible.fr (2014) Alain Roan for Toulouse Open Data Challenge - Creative Common
/***  little hack starts here ***/
L.Map = L.Map.extend({
    openPopup: function(popup) {
        //        this.closePopup();  // just comment this
        this._popup = popup;

        return this.addLayer(popup).fire('popupopen', {
            popup: this._popup
        });
    }
}); /***  end of hack ***/

var map = L.map('map').setView([43.600, 1.451], 13); //Toulouse area
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'; //OpenStreetMap copyright
L.tileLayer(
//	'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', { //Custo of the map
//    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
	'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
//	'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {



	maxZoom: 21,
	zoomControl: false,
	attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'<a href="http://perceptible.fr">perceptible.fr</a>',
	id: 'examples.map-i86knfo3'
}).addTo(map);
map._layersMaxZoom=21;
map._layersMinZoom=12;
map.scrollWheelZoom.disable();
map._initPathRoot();

// Drop Down for Transport Mode selection
var drop = L.control({position: 'topright'});
drop.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend');

	div.innerHTML = "<select id='dropdown' onchange ='updateDropdown(this.value)'><option>Tous</option><option>A pied</option><option>En velo</option><option>En voiture</option></select>";
	div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

	return div;
};

drop.addTo(map);

// Information panel
var panel = L.control({position: 'bottomleft'});
panel.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend');
	div.innerHTML = "<div id='panel'> </div>";
	div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

	return div;
};

panel.addTo(map);



function showPosition(position) {
	console.log("Latitude: " + position.coords.latitude +
	"<br>Longitude: " + position.coords.longitude);
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}