/*
 * MODELE PRINICIPAL DE L'APPLI
 */
// Modèle prinicipal.
// Instancie la vue principale et lance le rendu
define([
  'underscore',
  'backbone',
  'src/views/main'
], function(_, Backbone, mainView) {
    
    var Main = Backbone.Model.extend({

        defaults:{
                url_images: "/",
                wrapper : $(),
                thumbs : null
        },

        initialize: function(){
            view = new mainView({model:this});
            view.render();
        }

    });

    return Main;
});