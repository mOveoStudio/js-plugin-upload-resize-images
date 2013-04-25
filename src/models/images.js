/*
 * LES MODELES/COLLECTIONS CONCERNANT LA GESTION DES IMAGES
 */

// Declaration du model Image
app.Models.Image = Backbone.Model.extend({
    defaults:{
            id: "",
            title : "",
            url : ""

    }
});


// Declaration de la collection de content
app.Collections.Images = Backbone.Collection.extend({
            model: app.Models.Image
            //localStorage : new Store("mvo_images"),
});
