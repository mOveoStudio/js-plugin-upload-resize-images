/*
 * VUE PRINCIPALE DE L'APPLI
 */
app.Views.main = Backbone.View.extend({
    
        el : $(),
        countCroppedImage : 0,

        initialize : function(){
            this.el = this.model.get('wrapper');

            _.bindAll(this,'generateImages','afterImageGenerate');
        },

        render: function(){

                //Initialisation des views des elements de l'appli
                this.thumbnailsModuleHTML = $(app.JST['template/thumbnailsModule']());
                this.uploadModuleHTML = $(app.JST['template/uploaderModule']());
                this.imagesModuleHTML = $("<div id='moduleSortImages' class='span12'/>");

                // On ajoute les div a l'element principal #wrapper
                $(this.el).append(this.uploadModuleHTML);
                $(this.el).append(this.imagesModuleHTML);
                $(this.el).append(this.thumbnailsModuleHTML);

                 // On créé la collection qui gérera les images du plugin
                app.collections.Images = new app.Collections.Images();

                this.img1 = new app.Models.Image({id:"250", url:"assets/images/01.jpg", type:'main_thumb'});
                this.img2 = new app.Models.Image({id:"630", url:"assets/images/03.jpg", type:'main_thumb'});

                app.collections.Images.add([this.img1, this.img2]);

                // Et le rendu de la collection d'images
                app.views.imagesView = new app.Views.ImagesView({el : this.imagesModuleHTML, collection : app.collections.Images});
                app.views.imagesView.render();

                // On créé la collection qui gérera les recadreurs d'images
                app.collections.thumbnailCroppers = new app.Collections.ThumbnailCroppers();

                // Creation de la vue de la collection de recadreurs
                app.views.thumbnailcroppersView = new app.Views.ThumbnailCroppersView({el : this.thumbnailsModuleHTML, collection : app.collections.thumbnailCroppers});

                // Manager de upload ficher
                app.models.uploader = new app.Models.Uploader();
                app.views.uploaderView = new app.Views.UploaderView({el : this.uploadModuleHTML, model : this.images});
                
                // Listener des evenements provenant des 3 modules
                // Listener fin de l'upload de l'image
                app.views.uploaderView.bind('endUpload', this.generateImageCropper, this);
                // Listener fin des recadrage des images pour miniatures
                app.views.thumbnailcroppersView.bind('endThumbnailsSelection', this.generateImages);
                // Listener changement ordre des images
                app.views.imagesView.bind('sortImages', this.sortImages);
        },

        // Creation de la collections de recadreur
        // TODO : Faire fonctionner ce code avec la collection Images ?
        generateImageCropper : function (d){


                $('body').find(".progress-upload").hide();


                imgname = d.filename;
                imgsize = d.imagesize;


                if(this.model.get("thumbs") == null) return;

                _.each(this.model.get("thumbs"), function(e){

                        thumbnailCropper = new app.Models.ThumbnailCropper({size: [e.h,e.w], img_size:imgsize, type:e.type});
                        app.collections.thumbnailCroppers.add(thumbnailCropper);

                },this)



                // Et le rendu de la collection de recadreur
                // TODO : Ne plus utliser les metas.. pas necessaires dans une vue
                app.views.thumbnailcroppersView.meta("imgURL", this.model.get('url_images') + "temp/" + imgname);
                app.views.thumbnailcroppersView.meta("imgSize", [imgsize[0], imgsize[1]]);

                app.views.thumbnailcroppersView.render();
                app.views.thumbnailcroppersView.delegateEvents();


        },

        // On delegue a la vue de la collection des recadreur la generation des miniatures
        // Genere les miniatures des images en appelant crop.php
        // TODO : rendre plus souple la sauvegarde dans les dossiers thumb et temp
        generateImages : function(e) {
            
                _this = this;
                
                this.countCroppedImage = 0;

                // Recadrage de chacune des miniatures 
                app.collections.thumbnailCroppers.each(function(model){
                coord = model.get("coord");

                    $.ajax({
                        type: "POST",
                        url : "assets/js/crop.php",
                        dataType:"json",
                        data : {
                                x : coord.x, 
                                y : coord.y, 
                                h : coord.h, 
                                w: coord.w, 
                                tw: model.get('size')[0], 
                                th: model.get('size')[1], 
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
                var image =  new app.Models.Image({id:e.id, url:e.url, type:e.type, name: e.name});
                app.collections.Images.add(image);
                this.countCroppedImage++;
                
                //Si le nombre de miniatures egal le nombre de thumbnail de la collection de thumbnail
                if( this.countCroppedImage == app.collections.thumbnailCroppers.models.length ) {
                    $.ajax({
                            url: 'assets/js/delete.php',
                            type: 'POST',
                            data: { url : app.views.thumbnailcroppersView.urlImage }
                    });
                    
                    // On vide le template de recadrage
                    app.views.thumbnailcroppersView.clean();
                }
        },
        
        sortImages : function(data){
            console.log("Renvoi le nouvel ordre : ", data);
        }
    
});

