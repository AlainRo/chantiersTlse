// perceptible.fr (2014) Alain Roan for Toulouse Open Data Challenge - Creative Common
//
// Decode le fichier json mis à disposition par Toulouse Métropole
// Les transformations notables sont:
// - création de l'échelle de gène à partir des infos de circulation
// - création d'une catégorie simplifiée de la nature des travaux
// - pretty print des noms de rues
//
//Renvoit la structure organisée par date successives
//


function DateDiff(d1, d2) {
	return (d1.getTime() - d2.getTime());
}

function hasstarted (e) {
			var t = new Date(e.date);
			var d = new Date(e.datedebut);
			return (DateDiff(t,d) > 0);}

function WeeksToGo(d) {
	var td = new Date(d.date);
	var tf = new Date(d.datefin);
	return Normalize(DateDiff(tf,td));
}


//---------------------------------------------------			
var gene= //Général, Voiture, Piéton, Cycliste
//---------------------------------------------------	
[	['Gêne de la circulation',			[2,1,0,1]],
	['Occupation de 1 file' ,			[3,2,0,2]],
	['Occupation de 2 files' ,			[3,2,0,2]],
	['Occupation de couloir de bus',	[3,1,0,1]],
	['Occupation de la contre allée',	[3,5,1,1]],
	['Occupation du trottoir',			[2,0,3,0]],
	['Occupation de la piste cyclable',	[2,1,1,3]],
	['Alternat' ,						[2,3,0,2]],
	['Rue traversée par 1/2 chaussée' , [3,3,0,2]],
	['Rue traversée par 1/3 chaussée' , [3,3,0,2]],
	['Rue sens unique',					[4,4,0,2]],
	['Rue traverse' ,					[4,3,0,1]],
	['Rue barrée' ,						[5,5,5,5]],
	['Sans incidence sur la circulation',[1,0,0,0]]];



gene= UTFpatch(gene);


function escapeRegExp(string) {
	return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function UTFpatch (arr) {
	var rv = {};
	arr.forEach(function (e) {
		rv[decode_utf8(e[0])]= e[1];
	});
	return rv;
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function text2criteria (s) {
	var patt = new RegExp("[a-z] -","ig"),
		rv = [],
		ss = s, //encode_utf8(s),
		rest = "",
		n = 0;
	while (ss.length >0) {
		n = ss.search(patt);
		if (n==-1)
			{rv.push(ss); return rv;}
		rest = ss.substring(0,n+1);
		rv.push(rest);
		ss = ss.substring(n + 4);
	}
return rv;

}



function unique(arr) {
	var a = [];
	arr = arr.map(function (e) {return e.trim();});
	for (var i=0, l=arr.length; i<l; i++)
		if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
			a.push(arr[i]);
	return a;
}

function capitaliseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function CapitalizeSentence(s) {
	var lw = s.split(' ');
	var Cs = lw.map(function (e) {
		return capitaliseFirstLetter(e);
	});
	var rv = "";
	Cs.forEach(function (e) {
		rv = rv + e + " ";
	});
	return rv;
}

function substWords(s) {
	var word = {
		'Av': 'av',
		'De': 'de',
		'Des': 'des',
		'La' : 'la',
		'Le': 'le',
		'Rpt': 'rond point',
		'Du': 'du',
		'Rue': 'rue',
		'Imp' : 'impasse',
		'D' : "d'",
		'L' : "l'",
		'Rte' : 'route',
		'All': decode_utf8('allée'),
		'Che': 'chemin'};
	var sb = s.split(" ").map(function (e){
		var sub = word[e];
		if (sub === undefined)
			return e;
		else
			return sub;
	});
	var rv = "";
	sb.forEach(function (e) {
		rv= rv + e + " ";
	});
	return rv;
}


function removeUnusedAddres(s) {
	var rv = s.replace('(','');
	rv = rv.replace(')','');
	rv = rv.replace('-','');
	rv = rv.replace(' +',' ');
	return rv;
}

function tidyEverything(s){
	var rv = CapitalizeSentence(s);
	rv = substWords(rv);
	rv = removeUnusedAddres(rv);
	return rv;
}

function BeautifyVoie(s) {
	var rv = [];
	if (s instanceof Array)
		s.forEach(function (e) {
			rv = rv.concat(unique(e.split("|")));});
	else
		rv = unique(s.split("|"));
	rv = rv.map(tidyEverything);
	return rv;
}

function scoreGene(n) {
	var lg = text2criteria(n.circulation);
	var score = [0,0,0,0];
	lg.forEach(function (e){
		var sc = gene[e];
		if (sc===undefined) console.log(e);
		score = sc.map(function (x, i) {

			return Math.max(score[i],x); //moins dramatique
//			return score[i]+x;
		});
	});
	n["score"] = score;
	return score;
}

/*
function NormalizeScores(l){
	var maxgene=[0,0,0,0];
	for (var i=0; i<4; i++){
		maxgene[i]=l.reduce(function (p,c){
			return Math.max(p, c.score[i]);
		},0);}
	l.forEach(function (e){e.scoreN=
		[e.score[0]/maxgene[0]*5,
		e.score[1]/maxgene[1]*5,
		e.score[2]/maxgene[2]*5,
		e.score[3]/maxgene[3]*5];
	});
}
*/
function Categories(s){
	var rv = "Inconnu";
	if (s !== undefined){
		var cat = s.split(",");
		rv = cat[0];}
	if (rv === 'SLT') {rv = 'Feux tricolores';}
	return rv;


}

function PrettyDuration(s){
	var d = 7*s;
	function plural(e){
		return (Math.floor(e) > 1)? "s" : "";}
	if (d<14){
		return Math.floor(d) + " jour" + plural(d);}
	if ((d>13) && (d<60)){
		return Math.floor(d/7) + " semaine" + plural(d/7);}
	if ((d>59) && (d<500)){
		return Math.floor(d/30) + " mois";}
	if (d>499){
		return Math.floor(d/365) + " an" + plural(d/365);}

}


function equalChantiers(a, b){
	//SLOW AND DIRTY
	var d1 = a.date,
		d2 = b.date;
	a.date =""; b.date="";
	var r1 = JSON.stringify(a),
		r2 = JSON.stringify(b);
	a.date = d1; b.date = d2;
	return (r1===r2);
}


function memberChantiers(l, a){
	return l.some(function (e) {
		return equalChantiers(e,a);});
}


function minDates(l) {
	var cd;
	return l.reduce(function (p,c){
		cd = new Date(c);
		return (DateDiff(p,cd)<0) ? p : cd;
	},new Date(l[0]));
}

function maxDates(l) {
	var cd;
	return l.reduce(function (p,c){
		cd = new Date(c);
		return (DateDiff(p,cd)>0) ? p : cd;
	},new Date(l[0]));
}


//---------------------------------------------
function readChantiers(data){

	data.forEach(function (d) {
		d.datedebut= d.datedebut.substring(0,4) + "-" + d.datedebut.substring(4,6) + "-" + d.datedebut.substring(6,8);
		d.datefin= d.datefin.substring(0,4) + "-" + d.datefin.substring(4,6) + "-" + d.datefin.substring(6,8);});
	
	var tmpdate, tmpvoie, tmppole, ekey;
	data.forEach(function (e) {
		tmpdate = e.date; // remove date of data to create key
		e.date="";
		e.id = "";//JSON.stringify(e); // new definition THE ULTIMATE
		e.date=tmpdate;
		e.intensity = function (m) {
			return this.score[m];};
		e.duration = function () {
			var td = ToDay;
			var tf = new Date(this.datefin);
			return Normalize(DateDiff(tf,td));};
		e.hasstarted = function () {
			var t = new Date(this.date);
			var d = new Date(this.datedebut);
			return (DateDiff(t,d) > 0);};
		e.category = Categories(e.nature);
	});

	data.forEach(function (d){
		d.LatLng= new L.LatLng(d.Y_WGS84,
								d.X_WGS84);});
	console.log('Lignes Totales: ' + data.length);
//fusion exact duplicates while keeping list of data dates
	bywork = d3.map();
	data.forEach(function (e){
		tmpdate = e.date;
		e.date="";
		ekey = JSON.stringify(e); // new definition THE ULTIMATE
		e.date=tmpdate;
		evalue =bywork.get(ekey);
		if (evalue){
			evalue.date.push(tmpdate);
		}
		else {
			evalue=e;
			evalue.date=[tmpdate];
			bywork.set(ekey,evalue);
		}
	});

	console.log('Lignes uniques: ' + bywork.values().length);

	byworkFlat = d3.map();
	bywork.values().forEach(function (e){
		tmpdate = e.date;
		tmpvoie = e.voie;
		tmppole = e.pole;
		e.date=""; e.voie="";e.pole="";
		ekey = JSON.stringify(e);
		evalue = byworkFlat.get(ekey);
		if (evalue){
			evalue.voie.push(tmpvoie);}
		else {
			evalue = e;
			evalue.voie = [tmpvoie];
			evalue.date=tmpdate;
			evalue.pole=tmppole;
			evalue.id=ekey;
			byworkFlat.set(ekey,evalue);
		}

	});
	console.log('Chantiers uniques: ' + byworkFlat.values().length);

/*
// Group the 'voies' into one array
	byworkFlat = Flat(bywork);
	function Flat(arr) {
		var FlatArr = [];
		arr.forEach(function (n) { //each node
			n.values.forEach(function (v){ //each date
				if (v.values.length > 1) { // if more than 1 object
					rv = [];
					v.values.forEach(function (e) {
						rv.push(e.voie);
					});
					v.values[0].voie=rv;
					v.values=[v.values[0]];
				}
				FlatArr.push(v.values[0]);
			});

	});
		return FlatArr;
}
*/
	byworkFlat.values().forEach(scoreGene);
/*
	byKey =d3.nest()
		.key(function (e) {return e.id;})
		.entries(byworkFlat.values());

	byKey.forEach(function (e) {
		var rv = [e.values[0]];
		e.values.forEach(function (d) {
			if (!memberChantiers(rv, d)){
				rv.push(d);
			}
			rv.sort(function asc (a,b){
				var da = new Date(a.date),
					db = new Date(b.date);
				return (DateDiff(da,db));
			});
			return rv;});
		e.values = rv;
	});
*/
	byKey =byworkFlat.values();

console.log(JSON.stringify(byKey));

	return byKey;

}

function chantiersAtDate(d) {
	// Tous les chantiers pour qui: debut <= date <= fin
	var debut, fin;
	var rv = byKey.filter(function (c) {
		debut = new Date(c.datedebut);
		fin = new Date(c.datefin);
		return ((DateDiff(d, debut) >= 0) && (DateDiff(fin, d) >=0));}

	);

	return rv;
}

function isWeird(){
	var rv =[];
	var md;
	byKey.forEach(function (e) {
		md = maxDates(e.date);
		if (DateDiff(md,new Date(e.datefin))>2000*24*60*60) {
			rv.push([md, e.datefin, e]);
		}
	});
	return rv;
}

function isWeird1(){
	var rv =[];
	rv = byKey.filter(function (e) {return (e.date.length === 1);
		});
	return rv;
}