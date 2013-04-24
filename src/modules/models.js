/*
 *
 * LES MODELES DE L'APPLICATION
 *
 */

define([
  'jquery',
  'underscore',
  'backbone',
  'src/app.js'
], function($, _, Backbone, app){
/*
 * MODELE PRINICIPAL DE L'APPLI
 */
// Modèle prinicipal. Il gère les instanciations des différents éléments de l'app
// et écoute les trigger des autres modèles
app.Models.main = Backbone.Model.extend({

    defaults:{
            url_images: "/",
            thumbs : null
    },


    initialize : function() {

            // Initialisation de la vue principale
            app.views.main = new app.Views.main({model:this, el:this.get('wrapper')});
            
            // On créé la collection qui gérera les images du plugin
            app.collections.Images = new app.Collections.Images();
            
            this.img1 = new app.Models.Image({id:"250", url:"assets/images/01.jpg", type:'main_thumb'});
            this.img2 = new app.Models.Image({id:"630", url:"assets/images/03.jpg", type:'main_thumb'});

            app.collections.Images.add([this.img1, this.img2]);
            
            // Et le rendu de la collection d'images
            app.views.imagesView = new app.Views.ImagesView({el : app.views.main.imagesModuleHTML, collection : app.collections.Images});
            app.views.imagesView.render();

            // On créé la collection qui gérera les recadreurs d'images
            app.collections.thumbnailCroppers = new app.Collections.ThumbnailCroppers();
            
            app.views.thumbnailcroppersView = new app.Views.ThumbnailCroppersView({el : app.views.main.thumbnailsModuleHTML, collection : app.collections.thumbnailCroppers});
            // Détection des évènements utilisateurs
            //var mainView = new MainView();

            // Manager de upload ficher
            app.models.uploader = new app.Models.Uploader();
            app.views.uploaderView = new app.Views.UploaderView({el : app.views.main.uploadModuleHTML, model : this.images});
            app.views.uploaderView.bind('endUpload', this.generateImageCropper, this);


            // On génére une popup avec les différents formats d'images pour les miniatures
            //this.generateImageCropper();

    },

    // Creation de la collections de recadreur
    // TODO : Faire fonctionner ce code avec la collection Images ?
    generateImageCropper : function (d){


            $('body').find(".progress-upload").hide();


            imgname = d.filename;
            imgsize = d.imagesize;
            

            if(this.get("thumbs") == null) return;

            _.each(this.get("thumbs"), function(e){

                    thumbnailCropper = new app.Models.ThumbnailCropper({size: [e.h,e.w], img_size:imgsize, type:e.type});
                    app.collections.thumbnailCroppers.add(thumbnailCropper);

            },this)



            // Et le rendu de la collection de recadreur
            app.views.thumbnailcroppersView.meta("imgURL", this.get('url_images') + "temp/" + imgname);
            app.views.thumbnailcroppersView.meta("imgSize", [imgsize[0], imgsize[1]]);
            app.views.thumbnailcroppersView.render();

            app.views.thumbnailcroppersView.bind('afterImagesGenerate', this.afterGenerateImage, this);

            //this.modalView.showModal();
            //this.thumbnailGeneratorView = new ThumbnailCropperView({ model : this.thumbnailCropper1 });

    },

    begincrop : function (){
            console.log("Ca commence à Crop !!!");
    },
    
    // On delegue a la vue de la collection des recadreur la generation des miniatures
    // TODO : A rapatriller ici
    generateImages : function(){

            app.views.thumbnailcroppersView.generateImages();

    },
    
    // On supprime l'image temporaire qu'on a utiliser pour les miniatures
    // Et on ajoute la nouvelle Image a la collection Images
    afterGenerateImage: function(arr, temp){

            _.each(arr, function(e){
                    var image =  new app.Models.Image({id:e.id, url:e.url, type:e.type, name: e.name});
                    app.collections.Images.add(image);
            }, this)

            //Suppression du fichier temp
            $.ajax({
                    url: 'assets/js/delete.php',
                    type: 'POST',
                    data: { url : temp }
            });

    }

})
	


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




/*
 * LES MODELES/COLLECTIONS CONCERNANT LE CROP DE MINIATURES
 */

// Model ThumbnailCropper
// @param id : doit être unique
// @param coord : initialisé au début, il change quand le user recadre l'image
// @param url : url de l'image qui sera crop
// @param size : taille de la miniature à générer
app.Models.ThumbnailCropper = Backbone.Model.extend({

        defaults:{
                id: "",
                coord : "",
                url : "",
                size : "",
                type : "",
                img_size : ""
        },

        initialize: function(){

                this.set("id", this.cid);

                //this.set('coord', [ 0, 0, this.get('size')[0], this.get('size')[1]]);
                w = this.get('size')[0];
                h = this.get('size')[1];
                ratio = (w / h >= 1) ? "horizontal" : "vertical";


                if(ratio == "horizontal"){


                        initW = this.get('img_size')[0];
                        initH = initW * (h / w);

                        initX = 0;
                        initY = this.get('img_size')[1] / 2 - initH /2;
                }
                else
                {
                        initH = this.get('img_size')[1];
                        initW = initH * (w / h);
                        initX = this.get('img_size')[0] / 2 - initW /2;
                        initY = 0;
                }


                this.set('coord', {
                                x : initX,
                                y : initY,
                                w : initW,
                                h : initH,
                                x2 : initX + initW,
                                y2 : initY + initH
                });


        }

})

// Declaration de la collection de cropper
app.Collections.ThumbnailCroppers = Backbone.Collection.extend({
            //model: app.Models.ThumbnailCropper
    
});




/*
 * LES MODELES/COLLECTIONS CONCERNANT L'UPLOAD DES FICHIERS IMAGES
 */
// Modele fichier upload
app.Models.Uploader = Backbone.Model.extend({})

return {
   mainModel : app.Models.main
}
})