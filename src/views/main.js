/*
 * VUE PRINCIPALE DE L'APPLI
 */
    
define([
  'underscore',
  'backbone',
  'src/templates/templates',
  'src/models/images',
  'src/views/images',
  'src/models/thumbnails',
  'src/views/thumbnails',
  'src/models/upload',
  'src/views/upload'
], function(_, Backbone, JST, Images, ImagesView, Thumbnails, ThumbnailsView, Upload, UploadView) {
    main = Backbone.View.extend({
    
        el : $(),
        countCroppedImage : 0,

        initialize : function(){
            this.el = this.model.get('wrapper');
            _.bindAll(this,'generateImages','afterImageGenerate','sortImages');
        },

        render: function(){

                //Initialisation des views des elements de l'appli
                this.thumbnailsModuleHTML = $(JST['template/thumbnailsModule']());
                this.uploadModuleHTML = $(JST['template/uploaderModule']());
                this.imagesModuleHTML = $("<div id='moduleSortImages'/>");

                // On ajoute les div a l'element principal #wrapper
                $(this.el).append(this.uploadModuleHTML);
                $(this.el).append(this.imagesModuleHTML);
                $(this.el).append(this.thumbnailsModuleHTML);

                 // On créé la collection qui gérera les images du plugin
                imagesCollection = new Images.imagesCollection();

                this.img1 = new Images.imageModel({id:"250", url:"assets/images/01.jpg", type:'main_thumb'});
                this.img2 = new Images.imageModel({id:"630", url:"assets/images/03.jpg", type:'main_thumb'});

                imagesCollection.add([this.img1, this.img2]);

                // Et le rendu de la collection d'images
                imagesView = new ImagesView({el : this.imagesModuleHTML, collection : imagesCollection});
                imagesView.render();

                // On créé la collection qui gérera les recadreurs d'images
                thumbnailCroppers = new Thumbnails.thumbnailsCollection();

                // Creation de la vue de la collection de recadreurs
                thumbnailCroppersView = new ThumbnailsView({el : this.thumbnailsModuleHTML, collection : thumbnailCroppers});

                // Manager de upload ficher
                uploader = new Upload();
                uploaderView = new UploadView({el : this.uploadModuleHTML, model : this.images});
                
                // Listener des evenements provenant des 3 modules
                // Listener fin de l'upload de l'image
                uploaderView.bind('endUpload', this.generateImageCropper, this);
                // Listener fin des recadrage des images pour miniatures
                thumbnailCroppersView.bind('endThumbnailsSelection', this.generateImages);
                // Listener changement ordre des images
                imagesView.bind('sortImages', this.sortImages);
        },

        // Creation de la collections de recadreur
        // TODO : Faire fonctionner ce code avec la collection Images ?
        generateImageCropper : function (d){

                
                // On lance la fonction déclarée avec en parametre l'image uploadee
                uploadFileFunction = this.model.get("onUploadFile");

                if(uploadFileFunction != null)
                    uploadFileFunction(d);
                
                
                $('body').find(".progress-upload").hide();


                imgname = d.filename;
                imgsize = d.imagesize;


                if(this.model.get("thumbs") == null) return;

                _.each(this.model.get("thumbs"), function(e){
                        thumbnailCropper = new Thumbnails.thumbnailModel({size: [e.h,e.w], img_size:imgsize, type:e.type});
                        thumbnailCroppers.add(thumbnailCropper);

                },this)



                // Et le rendu de la collection de recadreur
                // TODO : Ne plus utliser les metas.. pas necessaires dans une vue
                thumbnailCroppersView.meta("imgURL", this.model.get('url_images') + "temp/" + imgname);
                thumbnailCroppersView.meta("imgSize", [imgsize[0], imgsize[1]]);

                thumbnailCroppersView.render();
                thumbnailCroppersView.delegateEvents();


        },

        // On delegue a la vue de la collection des recadreur la generation des miniatures
        // Genere les miniatures des images en appelant crop.php
        // TODO : rendre plus souple la sauvegarde dans les dossiers thumb et temp
        generateImages : function(e) {
            
                _this = this;
                
                this.countCroppedImage = 0;

                // Recadrage de chacune des miniatures 
                thumbnailCroppers.each(function(model){
                coord = model.get("coord");
                
                    Backbone.ajax({
                        type: "POST",
                        url : "assets/js/crop.php",
                        dataType:"json",
                        data : {
                                x : Math.round(coord.x), 
                                y : Math.round(coord.y), 
                                h : Math.round(coord.h), 
                                w: Math.round(coord.w), 
                                tw: Math.round(model.get('size')[0]), 
                                th: Math.round(model.get('size')[1]), 
                                src: $('#target').attr('src'), 
                                name: 'img-generate_' + model.get('size')[0] + "x" + model.get('size')[1],
                                type: model.get('type')
                                },						
                        success : _this.afterImageGenerate,
                        error : function(e){ console.log(e);}
                    })
                });

        },

        // Et on ajoute la nouvelle Image a la collection Images
        // On supprime l'image temporaire qu'on a utiliser pour les miniatures
        afterImageGenerate : function(data){
                
                var e = data;
                var image =  new Images.imageModel({id:e.id, url:e.url, type:e.type, name: e.name});
                imagesCollection.add(image);
                this.countCroppedImage++;
                
                //Si le nombre de miniatures egal le nombre de thumbnail de la collection de thumbnail
                if( this.countCroppedImage == thumbnailCroppers.models.length ) {
                    $.ajax({
                            url: 'assets/js/delete.php',
                            type: 'POST',
                            data: { url : thumbnailCroppersView.urlImage }
                    });
                    
                    // On vide le template de recadrage
                    thumbnailCroppersView.clean();

                    // On lance la fonction déclarée avec en parametre la liste des images
                    createThumbnailsFunction = this.model.get("onCreateThumbnail");

                    if(createThumbnailsFunction != null) createThumbnailsFunction(imagesCollection);
                }
        },
        
        sortImages : function(data){
                
                // On lance la fonction déclarée avec en parametre le nouvel ordre
                sortFunction = this.model.get("onSortImages");

                if(sortFunction != null) sortFunction(data);
        }
    
    });
    
    return main;
});

