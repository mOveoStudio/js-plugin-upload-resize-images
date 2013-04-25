/*
 * MODELE PRINICIPAL DE L'APPLI
 */
// Modèle prinicipal.
// Instancie la vue principale et lance le rendu
app.Models.main = Backbone.Model.extend({

    defaults:{
            url_images: "/",
            wrapper : $(),
            thumbs : null
    },
    
    initialize:function(){
        app.views.main = new app.Views.main({model:this});
        app.views.main.render();
    }

})