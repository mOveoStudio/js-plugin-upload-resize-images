/*
 *
 * FICHIER PRINCIPAL DE L'APPLICATION
 *
 */


// Déclaration de l'espace de nom
var app = {
  
  // Les classes
  Collections: {},
  Models: {},
  Views: {},
  
  // Les instances
  collections: {},
  models: {},
  views: {},
  
  init: function () {
  
    //Initialisation du model principal
    app.models.main = new app.Models.main({
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

