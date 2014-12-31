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
/*
// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoiYWxhaW5yIiwiYSI6ImVUZnpqdXcifQ.5Dg9vmLhSJoM_E0IViGdyA';
// Create a map in the div #map
L.mapbox.map('map', 'alainr.k0b8me7e');
*/
var map = L.map('map').setView([43.600, 1.451], 13); //Toulouse area
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'; //OpenStreetMap copyright
L.tileLayer(
	'http://{s}.tiles.mapbox.com/v3/alainr.k0b8me7e/{z}/{x}/{y}.png',{
//	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
//	'https://a.tiles.mapbox.com/v4/alainr.k0b8me7e?access_token=pk.eyJ1IjoiYWxhaW5yIiwiYSI6ImVUZnpqdXcifQ.5Dg9vmLhSJoM_E0IViGdyA#4/43.58/1.35', {
//   'https://a.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxhaW5yIiwiYSI6ImVUZnpqdXcifQ.5Dg9vmLhSJoM_E0IViGdyA', {
//	'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', { //Custo of the map
//    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
//	'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
//-	'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {


	maxZoom: 21,
	zoomControl: false,
	attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'<a href="http://perceptible.fr">perceptible.fr</a>',
	id: 'examples.map-i86knfo3'
}).addTo(map);

// Buttons mode
L.easyButton('fa-info',   function () {
	d3.selectAll('.leaflet-bar-part').classed('active',false);
	d3.select(this.link).classed('active',true);
	setMode(0);},"tous les chantiers");
L.easyButton('fa-car',      function () {
	d3.selectAll('.leaflet-bar-part').classed('active',false);
	d3.select(this.link).classed('active',true);
	setMode(1);},"génants en voiture");
L.easyButton('fa-male',     function () {
	d3.selectAll('.leaflet-bar-part').classed('active',false);
	d3.select(this.link).classed('active',true);
	setMode(2);},"génants à pied");
L.easyButton('fa-bicycle',  function () {
	d3.selectAll('.leaflet-bar-part').classed('active',false);
	d3.select(this.link).classed('active',true);
	setMode(3);},"génants à vélo");

// info is the default display
d3.select('.leaflet-bar-part').classed('active',true);

// LEGEND
var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {
var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML +=
    '<img src="images/legend.png" alt="legend" width="257 height="199">';

return div;
};

legend.addTo(map);

// WATERMARK
var watermark = L.control({position: 'topleft'});

watermark.onAdd = function (map) {
var div = L.DomUtil.create('div', 'info watermark');

    div.innerHTML +=
    '<svg width="800" heigth="60"> <text x ="200" y="100" font-size="100px"></text> </svg>';
//    '<img src="images/legend.png" alt="legend" width="500" height="500">';
return div;
};

//watermark.addTo(map);

// GRAPH
var graph = L.control({position: 'bottomleft'});

graph.onAdd = function (map) {
var div = L.DomUtil.create('div', 'info graph');

    div.innerHTML +=
    '<svg width="800" heigth="200">  </svg>';
return div;
};

//graph.addTo(map);

map._layersMaxZoom=21;
map._layersMinZoom=12;
map.scrollWheelZoom.disable();
map._initPathRoot();



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