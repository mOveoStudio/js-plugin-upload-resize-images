/*
 *
 * LES VUES DE L'APPLICATION
 *
 */



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
                }
        },
        
        sortImages : function(data){
            console.log("Renvoi le nouvel ordre : ", data);
        }
    
});





/*
 * LES VUES CONCERNANT LE CROP DE MINIATURES
 */


// Vue de la collection de recadreurs d'image
app.Views.ThumbnailCroppersView = Backbone.View.extend({
        
        urlImage : "",
        countReturn : 0,
        
        initialize: function(){
                

                this.templateThumbnailsList = app.JST['template/thumbnailsList'];
                this.templateCropZone = app.JST['template/thumbnailCropZone'];

                this._meta = {

                        currentModel : null,
                        countReturn : 0

                };
                _.bindAll(this,"onCropSelect","applyJCrop","clickOnGenerateButton");
                
        },

        meta: function(prop, value) {
                if (value === undefined) {
                        return this._meta[prop]
                } else {
                        this._meta[prop] = value;
                }
        },

        events : {
                'click #nav-image-size a' : "changeTumbnail",
                'click #generate-image' : "clickOnGenerateButton"
        },
        
        clickOnGenerateButton : function (){
            this.trigger("endThumbnailsSelection");
        },

        // Affichage du module de thumbnail
        render : function() {
                tmbnls = app.collections.thumbnailCroppers.toJSON();
                
                var renderedContent = this.templateThumbnailsList({ thumbnails : tmbnls });

                $(this.el).find("#nav-image-size").html(renderedContent);

                $(this.el).find("#cropped-container").html(this.templateCropZone({url : this.meta("imgURL")}));
               
                this.meta('currentModel', app.collections.thumbnailCroppers.models[0]);
                
                this.countReturn = 0;
                this.urlImage = this.meta("imgURL");

                setTimeout(this.applyJCrop,200);
                
                return this;
        },
        
        clean: function(){
            
            this.collection.reset();
            $(this.el).find("#nav-image-size").html("");
            $(this.el).find("#cropped-container").html("");
            
        },
        
        
        // Applique le plugin jCrop au visuel principal apres 200ms
        applyJCrop : function(){
                var _this = this;
                jcrop = $(this.el).find('#target').Jcrop({

                        bgOpacity: 0.3,
                        allowSelect: false,
                        bgColor: '#212121',
                        addClass: 'jcrop-light model-',
                        aspectRatio: this.meta('currentModel').get('size')[0] / this.meta('currentModel').get('size')[1],
                        setSelect:   [ this.meta('currentModel').get('coord').x, this.meta('currentModel').get('coord').y, this.meta('currentModel').get('coord').x2, this.meta('currentModel').get('coord').y2],
                        trueSize: [this.meta("imgSize")[0],this.meta("imgSize")[1]],
                        boxWidth: 500,
                        boxHeight: 400,
                        onSelect: this.onCropSelect


                },function(){
                        _this.meta('jcropAPI',this); 
                        $(this.ui.holder).css("margin-left", (500 - $(this.ui.holder).width()) / 2 + "px");
                        $(this.ui.holder).css("margin-top", (400 - $(this.ui.holder).height()) / 2 + "px");
                });


        },
        
        // Chaque fois que la selection change on met a jour les coordonnees du model en cours
        onCropSelect: function(e){
            this.meta('currentModel').set('coord',e);
        },
        
        // Applique un nouveau jCrop de la taille de la miniature voulue
        changeTumbnail : function(e) {

                destURL = $(e.target).attr('href').replace('#','');
                this.meta('currentModel', app.collections.thumbnailCroppers.get(destURL));

                currentCoord = this.meta('currentModel').get('coord');
                currentSize = this.meta('currentModel').get('size');

                this.meta('jcropAPI').setOptions({aspectRatio: currentSize[0]/currentSize[1]});
                this.meta('jcropAPI').setSelect([currentCoord.x, currentCoord.y, currentCoord.x2, currentCoord.y2]);

                $("#nav-image-size li").removeClass('active');
                $(e.target).parent().addClass('active');
                e.preventDefault();
                
        }


});






/*
 * LES VUES CONCERNANT L'AFFICHAGE DES IMAGES ET LEUR TRI
 */

// Vue de la Collection de Model Image
app.Views.ImagesView = Backbone.View.extend({
        el : $(),
        initialize: function(){
            
                this.el = app.views.main.imagesModuleHTML;

                this.template = app.JST['template/imagesCollection'];

                // A chaque modif/ajout/suppr de la collection Images on lance le render
                _.bindAll(this, 'render', 'changeOrderArray');
                this.collection.bind('change', this.render);
                this.collection.bind('add', this.render);
                this.collection.bind('remove', this.render);
   

        },

        render : function() {
            
                var renderedContent = this.template({ images : this.collection.toJSON()});
                
                $(this.el).html(renderedContent);
                
                // Applique le plugin de Drag&Drop de jQueryUI
                $(this.el).find('#images-container').sortable({
                        revert:100,
                        stop: this.changeOrderArray
                });
                
                return this;
        },
        
        // Methode lancee chaque fois que l'ordre des images est modifiee
        changeOrderArray : function(ev, ui){
                arr = $(this.el).find('#images-container').sortable('toArray', 'attr-id');
                this.trigger("sortImages", arr);
        }
});



    


/*
 * LES VUES CONCERNANT L'UPLOAD DES FICHIERS
 */

app.Views.UploaderView = Backbone.View.extend({
        
        initialize : function() {
         
         _.bindAll(this);   
            
        },
        
        events : {
                "change :file" : 'inputFileChange'
        },
        
        // Lorsque le champ uploadfile est modifie
        inputFileChange : function(){

                var formData = new FormData($(this.el).find(".formfileupload")[0]);

                $.ajax({
                        url: 'assets/js/upload.php',
                        type: 'POST',
                        dataType:"json",
                        xhr: function() {
                            myXhr = $.ajaxSettings.xhr();
                            if(myXhr.upload){
                                    myXhr.upload.addEventListener('progress',this.progressHandlingFunction, false);
                            }
                            return myXhr;
                        },
                        beforeSend: this.beforeSendHandler,
                        success: this.completeHandler,
                        data: formData,
                        //Options to tell JQuery not to process data or worry about content-type
                        cache: false,
                        contentType: false,
                        processData: false
                });

        },
        
        // Au lancement de l'upload
        // Initialisation de la barre de progression
        beforeSendHandler: function(){
                $(this.el).find('.progress-upload').show().fadeIn();
                $(this.el).find('.progress-upload .progress .bar').css({"width": "0%", "animation-duration":"0s"});
        },

        // A chaque donnees recues
        // Mise a jour de la barre de progression
        progressHandlingFunction: function (e){
                percentage = Math.round(e.loaded / e.total * 100) + "%";
                if(e.lengthComputable){
                        $(this.el).find('.progress-upload .progress .bar').css("width", percentage);
                        $(this.el).find('.progress-upload .percentage').html(percentage);
                }
        },
        
        // Quand l'upload est termine
        completeHandler : function(data){
                $(this.el).find('.progress-upload .progress .bar').css("width", "100%");
                $(this.el).find('.progress-upload .text').html("<small>Fichier uploadé avec succès</small>");
                $(this.el).find('.progress-upload .progress').removeClass('progress-striped');
                $(this.el).find('.progress-upload .progress').addClass('progress-success');

                var _this = this;
                
                setTimeout(function(){
                        _this.trigger("endUpload",data);
                        $(_this.el).find('.progress-upload').hide();
                },2000)

        }

    });
        