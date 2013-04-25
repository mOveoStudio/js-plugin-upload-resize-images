/*
 * LES MODELES/COLLECTIONS CONCERNANT LA GESTION DES IMAGES
 */

define([
  'underscore',
  'backbone'
], function(_, Backbone, JST, Images) {
    

    // Declaration du model Image
    var Image = Backbone.Model.extend({
        defaults:{
                id: "",
                title : "",
                url : ""

        }
    });


    // Declaration de la collection de content
    var Images = Backbone.Collection.extend({
                model: Image
                //localStorage : new Store("mvo_images"),
    });

    // Retourne le model et la collection
    return {
        imageModel : Image,
        imagesCollection : Images
    };

});