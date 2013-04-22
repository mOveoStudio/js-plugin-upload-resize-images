/*
 *
 * LES VUES DE L'APPLICATION
 *
 */
// Vue principale. Détecte les actions utilisateurs sur les composants de la page HTML
app.Views.main = Backbone.View.extend({


});

// View de la collection de recadreurs d'image
app.Views.ThumbnailCroppersView = Backbone.View.extend({
        //el : $('#target-cropped-container'),
        el : $('#cropped-body'),
        initialize: function(){
                this.template = _.template($("#container-cropped-template").html());
                this._meta = {

                        currentModel : null,
                        countReturn : 0

                };	
        },

        meta: function(prop, value) {
                if (value === undefined) {
                        return this._meta[prop]
                } else {
                        this._meta[prop] = value;
                }
        },

        onCropSelect: function(e){
                //_this.meta('currentModel').set('coord', e);
                _this.meta('currentModel').set('coord',e);

        },

        events : {

                // Au clic sur le menu de thumnails on change la colonne de gauche de la popup
                'click #nav-image-size a' : "changeTumbnail"
},

        changeTumbnail : function(e) {

                destURL = $(e.target).attr('href').replace('#','');

                _this.meta('currentModel', app.collections.ThumbnailCroppers.get(destURL));

                currentCoord = _this.meta('currentModel').get('coord');
                currentSize = _this.meta('currentModel').get('size');

                _this.meta('jcropAPI').setOptions({aspectRatio: currentSize[0]/currentSize[1]});
                _this.meta('jcropAPI').setSelect([currentCoord.x, currentCoord.y, currentCoord.x2, currentCoord.y2]);




                destURL = $(e.target).attr('href').replace('#','');
                $("#nav-image-size li").removeClass('active');
                $(e.target).parent().addClass('active');
                $("#cropped-container li").hide();
                $("#cropped-container li#img-" + destURL).fadeIn(200);
                e.preventDefault();
        },

        render : function() {
                tmbnls = app.collections.ThumbnailCroppers.toJSON();
                var renderedContent = this.template({ thumbnails : tmbnls });

                //$(this.el).html(renderedContent);
                $(this.el).find("#nav-image-size").html(renderedContent);

                $(this.el).find("#cropped-container").html("<img src='"+this.meta("imgURL")+"' id='target'/>");

                _this = this;


                app.collections.ThumbnailCroppers.each(function(model){

                        var modelView = new app.Views.ThumbnailCropperView({model : model});

                })

                this.meta('currentModel', app.collections.ThumbnailCroppers.models[0]);


                setTimeout(function(){

                jcrop = $(_this.el).find('#target').Jcrop({

                        bgOpacity: 0.3,
                        allowSelect: false,
                        bgColor: '#212121',
                        addClass: 'jcrop-light model-',
                        aspectRatio: _this.meta('currentModel').get('size')[0] / _this.meta('currentModel').get('size')[1],
                        setSelect:   [ _this.meta('currentModel').get('coord').x, _this.meta('currentModel').get('coord').y, _this.meta('currentModel').get('coord').x2, _this.meta('currentModel').get('coord').y2],
                        trueSize: [_this.meta("imgSize")[0],_this.meta("imgSize")[1]],
                        boxWidth: 500,
                        boxHeight: 400,
                        onSelect: _this.onCropSelect


                },function(){
                        _this.meta('jcropAPI',this); 
                        $(this.ui.holder).css("margin-left", (500 - $(this.ui.holder).width()) / 2 + "px");
                        $(this.ui.holder).css("margin-top", (400 - $(this.ui.holder).height()) / 2 + "px");

                });


                },200,_this)






                return this;
        },

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
                                success : _this.afterImagesGenerate

                        })
                });

},

        afterImagesGenerate : function(data){
                arr = _this.meta("arrayReturn");
                arr.push(data);
                _this.meta("countReturn", _this.meta("countReturn") + 1);

                // Si le nb de miniatures générées est égal au nombre de model présent dans la collection
                // On lance le trigger de fin
                if(_this.meta("countReturn") >= app.collections.ThumbnailCroppers.length)
                        _this.trigger("afterImagesGenerate",arr, $('#target').attr('src'));
        }


});


// Vue de la Collection de Model Image
app.Views.ImagesView = Backbone.View.extend({
    el : $('#doc-container-template'),
    
    initialize: function(){
        this.template = _.template($("#docs-collection-template").html());

        /*--- binding ---*/
        _.bindAll(this, 'render');
        this.collection.bind('change', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
        /*---------------*/
    
    },

        render : function() {
            
                var renderedContent = this.template({ images : this.collection.toJSON()});
                
                
                $(this.el).html(renderedContent);
                $(this.el).find('#doc-container').sortable({
                        revert:100,
                        stop: this.changeOrderArray
                });
                return this;
        },

        changeOrderArray : function(ev, ui){
                arr = $(this).sortable('toArray', 'attr-id');
        }
});


// View du recadreur d'image
	app.Views.ThumbnailCropperView = Backbone.View.extend({
		el : $('#modals-container'),
		
		initialize : function() {
			

		},
		
		render : function(el){
			
			
		
		},
		
		updateCoords : function(obj,coord) {
			//_this.model.set('coord', coord);
			
		}
	
	})
	
	window.ModalView = Backbone.View.extend({
        el : $('#modals-container'),
		

        initialize : function() {
            //Nothing to do now

        },
		
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
		},
		
        error : function(model, error) {
            console.log(model, error);
            return this;
        }

    });
    
    
    app.Views.UploaderView = Backbone.View.extend({
		el : $(".formfileupload"),
		
		events : {
			"change :file" : function(e){
				fileInput = e.target;
				
				var file = fileInput.files[0];
				name = file.name;
				size = file.size;
				type = file.type;

				this.launchUpload();
			
			}
		},
		
		launchUpload : function(){
		
			var formData = new FormData($(this.el)[0]);
                        _this = this;
			
			$.ajax({
				url: 'assets/js/upload.php',  //server script to process data
				type: 'POST',
				dataType:"json",
				xhr: function() {  // custom xhr
				myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ // check if upload property exists
					myXhr.upload.addEventListener('progress',_this.progressHandlingFunction, false); // for handling the progress of the upload
				}
				return myXhr;
				},
				//Ajax events
				beforeSend: _this.beforeSendHandler,
				success: _this.completeHandler,
				//error: errorHandler,
				// Form data
				data: formData,
				//Options to tell JQuery not to process data or worry about content-type
				cache: false,
				contentType: false,
				processData: false
			});
		
		},
		
		beforeSendHandler: function(){
			$(_this.el).find('.progress-upload').show().fadeIn();
			$(_this.el).find('.progress-upload .progress .bar').css({"width": "0%", "animation-duration":"0s"});
		},
		
		progressHandlingFunction: function (e){
		
			percentage = Math.round(e.loaded / e.total * 100) + "%";
			if(e.lengthComputable){
				$(_this.el).find('.progress-upload .progress .bar').css("width", percentage);
				$(_this.el).find('.progress-upload .percentage').html(percentage);
			}
		},

		completeHandler : function(data){
			
			$(_this.el).find('.progress-upload .progress .bar').css("width", "100%");
			$(_this.el).find('.progress-upload .text').html("<small>Fichier uploadé avec succès</small>");
			$(_this.el).find('.progress-upload .progress').removeClass('progress-striped');
			$(_this.el).find('.progress-upload .progress').addClass('progress-success');
			
			_this = _this;
			setTimeout(function(){
				_this.trigger("endUpload",data);
				$(_this.el).find('.progress-upload').hide();
			},2000)
			
		},
		
		render : function(){
			
	

		
		}
	
	});
        