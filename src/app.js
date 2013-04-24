/*
 *
 * FICHIER PRINCIPAL DE L'APPLICATION
 * 
 * Cette application sert a faciliter la creation de miniature au moment de l'upload
 * Elle se separera en 3 partie distincte (3 modules) :
 * 
 * 1) Le module d'upload qui permet de remplacer le input type="file" et de telecharger un fichier image en ajax.
 * Une barre de progression marquera l'avancee du telechargement
 * 
 * 2) Le module de selection des miniatures :
 * D'apres un même image il sera possible de générer plusieurs miniatures et de choisir pour chacune de ces miniatures
 * le recadrage.
 * @param image string : image d'origine
 * @param thumbs array : liste des tailles de recadrage
 * @return un Object contenant la liste des nouvelle coordonnees de recadrage pour chacune des miniatures
 * 
 * 3) Le module de tri des images d'une bibliotheque
 * @param images : liste des images
 */


// Déclaration de l'espace de nom
var app = {
  
  // Les classes
  Collections: {},
  Models: {},
  Views: {},
  Templates: {},
  
  // Les instances
  collections: {},
  models: {},
  views: {},
  templates: {},
  
  init: function () {
      
    //Initialisation du model principal
    app.models.main = new app.Models.main({
            "wrapper" : $("#thumbnailsManagerJS"),
            "url_images" : "assets/",
            "thumbs" : [{
                            h : "200",
                            w : "350",
                            type : "200x250"
                     },{
                            h : "300",
                            w : "300",
                            type : "300x300"
                    },{
                            h : "260",
                            w : "180",
                            type : "main_thumb"

                    }


            ]
    });
    
    
  }
};

$(document).ready(function () {

  // On lance l'application une fois que notre HTML est chargé
  app.init();
  
}) ;

