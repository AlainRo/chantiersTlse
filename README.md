#chantiersTlse
---

Visualisation des chantiers à Toulouse.
Chaque chantier est représenté par un cercle centré sur le point GPS: 

 * de rayon proportionnel l'intensité de la gêne occasionnée en redondance avec la couleur
 * d'une épaisseur visualisant la durée restante (3 mois = cercle plein)
 
Un clic dans le cercle affiche un pop up avec des infos. 

(shift clic) pour un affichage de plusieurs pop-up.

Zoom par double clic, unzoom par shift double clic.

Quatre modes d'affichage:

  * Global
  * à pied
  * en vélo
  * en voiture

Une glissière qui anime le temps:

* en arrière (minimum des dates de débuts)
* en avant (plus grande des dates de début + 3 mois)

La sélection simple est possible sur tablette et téléphone.

##Utilise

	- d3.js
	- leaflet.js
	- d3tootip.js
