// perceptible.fr (2014) Alain Roan for Toulouse Open Data Challenge - Creative Common
//
var modeTransport = 0;
var modeType = {"Tous":0, "En voiture":1, "A pied": 2, "En velo": 3};

var MoveStart = -1;
var MoveEnd = -1;
var permanentMark = true;
var activeMark = [];
//moment.locale('fr');

//----- Misc utilities 

function isMobile () {
	return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4)))
;}

var Today =0;



function DateDiff(d1, d2) {
	return (d1.getTime() - d2.getTime());
}

var zoomcorrection =d3.scale.linear()
	.domain([12, 19])
	.range([1, 10]);


function size() {
	if (!isMobile()) {return Math.max(0,zoomcorrection(map.getZoom()));}
		return Math.max(0,2* zoomcorrection(map.getZoom()));

}



function Normalize(d) {
	//Nombre de semaine
	var rv = d/(60*60*24*7*1000);
	if (rv < 0) {rv = -1;}
	else if (rv < 1) {rv = 1;}
	return rv;
}



// - 

var color = d3.scale.ordinal()
	.domain([1,2,3,4,5])
//	.range([ 'green', '#fe9929', '#d95f0e', "red", "black"]);
	.range([ 'green', 'green','#fe9929', '#d95f0e', "red"]);


var intensity = d3.scale.ordinal()
	.domain([0,1,2,3,4,5])
	.range([0,4,8,12,16,20]);

var duration = d3.scale.linear()
	.domain([1,4,9,24,52])
	.clamp(true)
	.range([0,400]);

function apparentRadius(d){
	return 0.25 * intensity(d.intensity(modeTransport))*size();
}

function sizeRadius(d){
	var int = apparentRadius(d);
	var sS = sizeStroke(d);
	return Math.max(int-(sS/2),1);
}
function sizeStroke(d){
	var int = apparentRadius(d);
	var dur = 5 * duration(d.duration())/(int*int);
	return Math.max(0.9,Math.min(int,Math.sqrt(dur)*Math.pow(1.6,size())));
//	return Math.pow(1.5,size());
}


function sizeIcon (d) {
	var dur = d.duration();
	if (dur<15){
		rv= Math.max(dur,1.5);}
	else {rv = Math.sqrt(15*dur);}

	return  (size() * rv);}




var marks = d3.select("#map").select('svg').append('g');

function updateDate(i){
	Today =i;
	update();

}



function JoinChantiers() {

	var chantiers = bydate[Today].values.filter(function (e){
			return (e.intensity(modeTransport)>0);});
	d3.select('#panel').text( bydate[Today].key.substring(5,10) + '->' + 'nb chantiers: ' + chantiers.length);

	var ch = marks.selectAll("circle")
		.data(chantiers,function (e) {return e.id;})
		.attr("transform",
			function(d) {
				return "translate("+
					map.latLngToLayerPoint(d.LatLng).x +","+
					map.latLngToLayerPoint(d.LatLng).y +")";});
		
	ch
		.attr('r', function (e) {return sizeRadius(e);})
		.style('stroke-width', function (e) {return sizeStroke(e);})
		.style("stroke", function (d) {return color(d.intensity(modeTransport));});

	return ch;
}

function RemoveChantiers(ch){
	ch.exit()
		.transition()
		.duration(250)
		.style('stroke-opacity', 0)
		.remove();
}


function enterChantiers(ch) {
	var che = ch.enter().append('circle')
		.style("stroke", function (d) {return color(d.intensity(modeTransport));})
		.style("stroke-opacity", 1e-6)
		.style('fill-opacity', 0)
		.attr('r', function (e) {return sizeRadius(e);})
		.style('stroke-width', function (d) {return sizeStroke(d);})
		.style('cursor','pointer')
		.attr("transform",
			function(d) {
				return "translate("+
					map.latLngToLayerPoint(d.LatLng).x +","+
					map.latLngToLayerPoint(d.LatLng).y +")";})
		.on('mouseover',mouseover)
		.on('mousedown',mousedown)
		.on('click',	function (d,i) {click(d,i);})
		.on('mouseup',	mouseup)
		.on('mouseout',	mouseout);
	return che;
}

function addChantiers(ch) {
	var che = enterChantiers(ch);
	che
		.transition()
		.duration(250)
		.attr('r', function (e) {return sizeRadius(e);})
		.style('stroke-width', function (e) {return sizeStroke(e);})
		.style("stroke-opacity", 0.8)
		;
}




function update() {

	var ch = JoinChantiers();

	var che = addChantiers(ch);

	RemoveChantiers(ch);

}





function updateDropdown(v){
modeTransport = modeType[v];

update();
}

function InfoChantier(d, i) {
	var rv = "";
	rv = "<div class='chantiers-" + i + "'>";
	rv = rv + "<b>Encore " + PrettyDuration(d.duration()) + "</b>";
	BeautifyVoie(d.voie).forEach(function (e) {
		rv = rv + '<br />  - ' + e;
	});
//	rv = rv + "<br />" + d.score;
//	rv = rv + "<br />" + sizeStroke(d);
//	rv = rv + "<br />" + sizeRadius(d);

	rv = rv + "<br /><b>Pourquoi: </b>" + d.category;
	rv = rv + "<br /><br/><b><i> " + d.circulation + "</i></b>";

	rv = rv + "</div>";
	return rv;
}


function pushMark(d, i){
	var am = L.marker(d.LatLng).addTo(map)
		.bindPopup(InfoChantier(d, i));
	activeMark.push(am);
	return am;
}

function popMark(){
	var am = activeMark.pop();
	if (am !==undefined) {map.removeLayer(am);}
	return activeMark;
}

function removeMark(){
	activeMark.forEach(function (e) {
		if (e !==undefined) {map.removeLayer(e);}
		});
	activeMark=[];
}


function mouseover(d){
	var c = d3.select(this);
//	d3.select(this).style({'stroke-width': 6});
	c.style('stroke-width', sizeStroke(d) + 6 + 'px');



}

function mouseout(d){
//	d3.event.stopPropagation();
	d3.select(this).style('stroke-width', function (d) {return sizeStroke(d);});
//	d3.select(this).style({'stroke-width': 2});
//	if (!permanentMark) {popMark();}

}

function mousedown(d){
	d3.event.stopPropagation();
}

function mouseup(d){
	d3.event.stopPropagation();
//	popMark();
}



function coucou (){
	console.log(this.childNodes[0].className);
}

function click(d, i){
	d3.event.stopPropagation();
	if (!d3.event.shiftKey){removeMark();}
	var x = pushMark(d, i).openPopup()._popup._contentNode;
	d3.select(x).on('click.trigger', coucou);

}

function setSlider(bydate) {
	d3.select('#sliderContain') //slider
		.style('position', 'relative')
		.style('left', '40px')
		.style('top', '-40px')
		.style('opacity', '1')
		.append('input')
		.attr("type", 'range')
		.attr('id', 'slider')
		.style('width', '500px')
		.attr('value', 0)
		.attr("class", 'slider')
		.attr('min', 0)
		.attr('max', bydate.length-1)
		.attr('step', 1)
		.attr('onchange', function (d) {return "updateDate(+this.value)";})
		.attr('oninput', function (d) {return "updateDate(+this.value)";});
	
	var sl = +d3.select('.slider').call(d3.helper.tooltip()
		.attr({class :'tooltip'})
		.text(function(d, i){ return '<div>' + bydate[Today].key + '</div>';})//	feature.call(tip);
		);

	map.on("viewreset", update);
}


d3.json("all.json", function (chantiers){
	readChantiers(chantiers);

	setSlider(bydate);

	update();


});