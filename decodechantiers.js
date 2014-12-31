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


function Normalize(d) {
	//Nombre de jours
	var rv = d/(60*60*24*1000)+1;
	if (rv < 0) {return -1;}
	return rv;
}

function FrenchDate(d){
	var m_names = new Array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");
	return d.toLocaleDateString();}
 


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
{
'Gêne de la circulation'			:[2,1,0,1],
'Occupation de 1 file'				:[3,2,0,2],
'Occupation de 2 files'				:[3,2,0,2],
'Occupation de couloir de bus'		:[3,1,0,1],
'Occupation de la contre allée'		:[3,2,1,1],
'Occupation du trottoir'			:[2,0,3,0],
'Occupation de la piste cyclable'	:[2,1,1,3],
'Alternat'							:[2,3,0,2],
'Rue traversée par 1/2 chaussée'	:[3,3,0,2],
'Rue traversée par 1/3 chaussée'	:[3,3,0,2],
'Rue sens unique'					:[4,4,0,2],
'Rue traverse'						:[4,3,0,1],
'Rue barrée'						:[5,5,5,5],
'Sans incidence sur la circulation'	:[1,0,0,0]};


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
		'Chem': 'chemin',
		'D' : "d'",
		'L' : "l'",
		'Pl': "place",
		'Bd': "bd",
		'Rte' : 'route',
		'All': 'allée',
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
	rv = unique(rv).map(tidyEverything);
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
//		cat = cat[0].split("-");
		rv = cat[0];}
	if (rv === 'SLT') {rv = 'Feux tricolores';}
	return rv;


}

function PrettyDuration(d){
	function plural(e){
		return (Math.floor(e) > 1)? "s" : "";}
	if (d<14){
		return Math.floor(d+0.5) + " jour" + plural(d+0.5);}
	if ((d>13) && (d<60)){
		return Math.floor((d+5)/7) + " semaine" + plural((d+5)/7);}
	if ((d>59) && (d<500)){
		return Math.floor((d+15)/30) + " mois";}
	if (d>499){
		return Math.floor((d+100)/365) + " an" + plural((d+100)/365);}

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

function HashString(m, s){
	var rv = m.get(s);
	var i = 'c' + m.size();
	if (rv !== undefined)
		{return rv;}
	m.set(s,i);
	return i;
}

function cloneObject(o) {
	var rv = {};
	d3.entries(o).forEach(function (e){
		rv[e.key]=e.value;
	});
	return rv;
}

function groupBy(d, key){
	var idKey = d3.map();
	var rv = d3.map();
	var e;
	var evalue,tmpcircu, tmp, ekey;
	d.forEach(function (o){
		e = cloneObject(o);

		tmp = e[key];tmpcircu =e.circulation;
		e[key]="";e.circulation ="";
//		ekey = HashString(idKey,JSON.stringify(e));
		ekey = JSON.stringify(e);
		e[key]=tmp;	e.circulation= tmpcircu;

		evalue =rv.get(ekey);
		if (evalue){
			evalue['groupBy' + key].push(e[key]);
			}
		else {
			e['groupBy' + key]=[e[key]];
			rv.set(ekey,e);
		}
	});
	return rv;
}

//---------------------------------------------

/*
function readChantiers(data){

	data.forEach(function (e) {
		e.LatLng= new L.LatLng(e.Y_WGS84,
								e.X_WGS84);
		e.datedebut= e.datedebut.substring(0,4) + "-" + e.datedebut.substring(4,6) + "-" + e.datedebut.substring(6,8);
		e.datefin= e.datefin.substring(0,4) + "-" + e.datefin.substring(4,6) + "-" + e.datefin.substring(6,8);
		delete e.Y_WGS84;
		delete e.X_WGS84;
		delete e.duree;
		delete e.id;
	});

	console.log('Lignes Totales: ' + data.length);
	var gvoie = groupBy(data,"voie");
	console.log('Lignes par voies: ' + gvoie.size());
	var gdate = groupBy(gvoie.values(),"date");
	console.log('Lignes par dates: ' + gdate.size());

	byKey =gdate.values();
	var i =0;
	byKey.forEach(function (e) {
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
		scoreGene(e);
		e.date= e.groupBydate;
		e.voie= e.groupByvoie;
		e.id = i++;
	});

	return byKey;

}
*/
function readCompress(data){

	data.forEach(function (e) {
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
	});

	return data;

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
	rv = byKey.filter(function (e) {return (e.date.length < 2) && 
		(e.date[0].substring(0,10) !== "2014-09-29" )
		&& (e.datedebut !== e.datefin)
		});
	return rv;
}
