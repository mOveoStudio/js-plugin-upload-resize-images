/*
 *
 * LES VUES DE L'APPLICATION
 *
 */



/*
 * VUE PRINCIPALE DE L'APPLI
 */
app.Views.main = Backbone.View.extend({

    
});





/*
 * LES VUES CONCERNANT LE CROP DE MINIATURES
 */


// Vue de la fenetre modal
// TODO : Supprimer et remplacer
app.Views.ModalView = Backbone.View.extend({
        el : $('#modals-container'),
		
        events : {
            //Au clic sur le bouton generate-image on déclenche l'event 'generateImages'
            'click #generate-image' : function(){ 
                this.trigger('generateImages'); 
            }
        },
		
        closeModal : function(){
                $(this.el).find('.modal').modal('hide');
        },
		
        showModal : function(){
            $(this.el).find('.modal').modal('show');
        }
});

// Vue de la collection de recadreurs d'image
app.Views.ThumbnailCroppersView = Backbone.View.extend({
    
        el : $('#cropped-body'),
        
        initialize: function(){
                this.template = _.template($("#container-cropped-template").html());
                this._meta = {

                        currentModel : null,
                        countReturn : 0

                };
                _.bindAll(this,"onCropSelect","applyJCrop", "generateImages");
        },

        meta: function(prop, value) {
                if (value === undefined) {
                        return this._meta[prop]
                } else {
                        this._meta[prop] = value;
                }
        },

        events : {
                'click #nav-image-size a' : "changeTumbnail"
        },

        // Affichage du module de thumbnail
        render : function() {
                tmbnls = app.collections.ThumbnailCroppers.toJSON();
                
                var renderedContent = this.template({ thumbnails : tmbnls });

                $(this.el).find("#nav-image-size").html(renderedContent);

                $(this.el).find("#cropped-container").html("<img src='"+this.meta("imgURL")+"' id='target'/>");
               
                this.meta('currentModel', app.collections.ThumbnailCroppers.models[0]);

                setTimeout(this.applyJCrop,200);

                return this;
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
                this.meta('currentModel', app.collections.ThumbnailCroppers.get(destURL));

                currentCoord = this.meta('currentModel').get('coord');
                currentSize = this.meta('currentModel').get('size');

                this.meta('jcropAPI').setOptions({aspectRatio: currentSize[0]/currentSize[1]});
                this.meta('jcropAPI').setSelect([currentCoord.x, currentCoord.y, currentCoord.x2, currentCoord.y2]);

                $("#nav-image-size li").removeClass('active');
                $(e.target).parent().addClass('active');
                e.preventDefault();
                
        },

        // Genere les miniatures des images en appelant crop.php
        // TODO : rendre plus souple la sauvegarde dans les dossiers thumb et temp
        // TODO : sortir cette methode de cette vue. Le traitement des images ne concerne pas le Crop
        generateImages : function(e) {
                _this = this;
                this.meta("countReturn", 0);
                this.meta("arrayReturn", []);
                app.collections.ThumbnailCroppers.each(function(model){
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
                        success : _this.afterImageGenerate
                    })
                });

        },
        
        // Chaque fois qu'une miniature est generee on verifie si c'est la derniere de la liste
        afterImageGenerate : function(data){
                arr = _this.meta("arrayReturn");
                arr.push(data);
                _this.meta("countReturn", _this.meta("countReturn") + 1);

                // Si le nb de miniatures générées est égal au nombre de model présent dans la collection
                // On lance le trigger de fin
                if(_this.meta("countReturn") >= app.collections.ThumbnailCroppers.length)
                        _this.trigger("afterImagesGenerate",arr, $('#target').attr('src'));
        }

});






/*
 * LES VUES CONCERNANT L'AFFICHAGE DES IMAGES ET LEUR TRI
 */

// Vue de la Collection de Model Image
app.Views.ImagesView = Backbone.View.extend({
    
        el : $('#doc-container-template'),
    
        initialize: function(){
            this.template = _.template($("#docs-collection-template").html());

            // A chaque modif/ajout/suppr de la collection Images on lance le render
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);

        },

        render : function() {
            
                var renderedContent = this.template({ images : this.collection.toJSON()});
                
                $(this.el).html(renderedContent);
                
                // Applique le plugin de drag&drop de jQueryUI
                $(this.el).find('#doc-container').sortable({
                        revert:100,
                        stop: this.changeOrderArray
                });
                
                return this;
        },
        
        // Methode lancee chaque fois que l'ordre des images est modifiee
        changeOrderArray : function(ev, ui){
                arr = $(this).sortable('toArray', 'attr-id');
                // Ne fait rien pour le moment
        }
});



    


/*
 * LES VUES CONCERNANT L'UPLOAD DES FICHIERS
 */

app.Views.UploaderView = Backbone.View.extend({
        el : $(".formfileupload"),
        
        initialize : function() {
         
         _.bindAll(this);   
            
        },
        
        events : {
                "change :file" : 'inputFileChange'
        },
        
        // Lorsque le champ uploadfile est modifie
        inputFileChange : function(){

                var formData = new FormData($(this.el)[0]);

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
        