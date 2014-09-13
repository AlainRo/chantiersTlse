#chantiersTlse
---

Visualisation des chantiers à Toulouse.
Chaque chantier est représenté par un cercle centré sur le point GPS: 
 * de rayon vaguement proportionnel à la durée restante
 * de couleur indiquant l'intensité de la gêne occasionnée
 
Un clic dans le cercle affiche un pop up avec des infos. (shift clic) pour un affichage de plusieurs pop-up.
Zoom par double clic, unzoom par shift double clic.

Quatre modes d'affichage:
  * Global
  * à pied
  * en vélo
  * en voiture

Une glissière qui anime le temps en arrière ou en avant (todo).

Pas encore complètement fonctionnel sur tablette et téléphone.

##Utilise

	* d3.js
	* moment.js
	* leaflet.js
	* d3tootip.js
