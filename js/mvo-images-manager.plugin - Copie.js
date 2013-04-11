(function($) {
	
	// Model Image
	// @param id
	// @param title
	// @param url
    window.Image = Backbone.Model.extend({
		defaults:{
			id: "",
			title : "",
			url : ""
		
		}
	})

	
	// Collection de model Image
	window.Images = Backbone.Collection.extend({
			model: Image,
			
			//localStorage : new Store("mvo_images"),
	})
	

	
	// Vue de la Collection de Model Image
	window.ImagesCollectionView = Backbone.View.extend({
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
	})
	
	
	// Model ThumbnailCropper
	// @param id : doit être unique
	// @param coord : initialisé au début, il change quand le user recadre l'image
	// @param url : url de l'image qui sera crop
	// @param size : taille de la miniature à générer
	window.ThumbnailCropper = Backbone.Model.extend({
	
		defaults:{
			id: "",
			coord : "",
			url : "",
			size : "",
			type : ""
		}
	
	})
	
	// Collection de recadreur d'image
	window.ThumbnailCroppers = Backbone.Collection.extend({
		model:ThumbnailCropper,
		
	
	})
	
	// View de la collection de recadreurs d'image
	window.ThumbnailCroppersView = Backbone.View.extend({
		el : $('#target-cropped-container'),
		initialize: function(){
			this.template = _.template($("#container-cropped-template").html());
			this._meta = {};	
		},
		
		meta: function(prop, value) {
			if (value === undefined) {
				return this._meta[prop]
			} else {
				this._meta[prop] = value;
			}
		},
		
		render : function() {
			console.log(this.meta("someProperty"));
			var renderedContent = this.template({ thumbnails : this.collection.toJSON()});
			
			//$(this.el).html(renderedContent);
			$(this.el).html(renderedContent);
			
			$(this.el).html("<img src='"+this.meta("someProperty")+"' id='target'/>");
			
			$(this.el).find('#target').Jcrop({
				
				bgOpacity: 0.3,
				allowSelect: false,
				bgColor: '#212121',
				addClass: 'jcrop-light model-'+ _this.model.id,
				aspectRatio: 200 / 200,
				setSelect:   [ 0, 0, 200, 200]
				
			});
			
			_this = this;
			
			/*this.collection.each(function(model){
				
				var modelView = new ThumbnailCropperView({model : model});
				modelView.render($(_this.el).find('#cropped-container'));
				
			})*/
			
			return this;
		},
		
		generateImages : function(e) {
			_this = this;
			this.collection.each(function(model){
				console.log(model);
				coord = model.get('jcrop_api');
				console.log(coord);
				coord = coord.tellSelect();
				
				$.ajax({
					type: "POST",
					url : "js/crop.php",
					dataType:"json",
					data : {
						x : coord.x, 
						y : coord.y, 
						h : coord.h, 
						w: coord.w, 
						tw: model.get('size')[0], 
						th: model.get('size')[1], 
						src: $('#target-' + model.get('id')).attr('src'), 
						name: 'img-generate_' + model.get('size')[0] + "x" + model.get('size')[1],
						type: model.get('type')
						},						
					success : _this.afterImagesGenerate
		
				})
			});
            
        },
		
		afterImagesGenerate : function(data){
			_this.trigger("afterImagesGenerate",data);
		}
	
	
	})
	
	// View du recadreur d'image
	window.ThumbnailCropperView = Backbone.View.extend({
		el : $('#modals-container'),
		
		initialize : function() {
			this.template = _.template($("#cropped-image").html());
			
			_this = this;

		},
		
		render : function(el){
			var renderedContent = this.template(this.model.toJSON());
			_this = this;

			el.append(renderedContent);
			
			_this.wRatio = _this.model.get('size')[0];
			_this.hRatio = _this.model.get('size')[1];
			
			_this.w = _this.model.get('img_size')[0];
			_this.h = _this.model.get('img_size')[1];
		
			jcropAPI = $(_this.el).find('#target').Jcrop({
				
				bgOpacity: 0.3,
				bgColor: '#212121',
				addClass: 'jcrop-light model-'+ _this.model.id,
				aspectRatio:  _this.wRatio / _this.hRatio,
				setSelect:   [ 0, 0, _this.w, _this.l]
				
			});
			_this.model.set('jcrop_api', jcropAPI);
			
			
			
		
		},
		
		updateCoords : function(obj,coord) {
			console.log("Mon object : ", obj, " et ", coord );
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
            'click #generate-image' : function(){ this.closeModal(); this.trigger('generateImages'); },
			
			// Au clic sur le menu de thumnails on change la colonne de gauche de la popup
			'click #nav-image-size a' : "changeTumbnail"
        },
		
		changeTumbnail : function(e) {
		
			destURL = $(e.target).attr('href').replace('#','');
			$("#nav-image-size li").removeClass('active');
			$(e.target).parent().addClass('active');
			$("#cropped-container li").hide();
			$("#cropped-container li#img-" + destURL).fadeIn(200);
			e.preventDefault();
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
	
	// Vue fichier upload
	window.Uploader = Backbone.Model.extend({
		
	
	})
	
	window.UploaderView = Backbone.View.extend({
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
				url: 'js/upload.php',  //server script to process data
				type: 'POST',
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
				console.log($(_this.el));
				$(_this.el).find('.progress-upload').hide();
			},2000)
			
		},
		
		render : function(){
			
	

		
		}
	
	})
	
	// Vue principale. Détecte les actions utilisateurs sur les composants de la page HTML
	window.MainView = Backbone.View.extend({
	
	
	})
	
	// Modèle prinicipal. Il gère les instanciations des différents éléments de l'app
	// et écoute les trigger des autres modèles
	window.MainModel = Backbone.Model.extend({
		
		initialize : function() {
			
			// On créé la collection qui gérera les images du plugin
			this.images = new Images();
			this.img1 = new Image({id:"250", url:"img/01.jpg", type:'main_thumb'});
			this.img2 = new Image({id:"630", url:"img/02.jpg", type:'main_thumb'});
			this.img3 = new Image({id:"150", url:"img/03.jpg", type:'main_thumb'});

			this.images.add([this.img1, this.img2, this.img3]);
			
			// Et le rendu de la collection d'images
			this.view = new ImagesCollectionView({collection : this.images});
			this.view.render();
			

			
			// Détection des évènements utilisateurs
			var mainView = new MainView();
			
			// Manager de upload ficher
			this.uploader = new Uploader();
			this.uploaderView = new UploaderView({model : this.images});
			this.uploaderView.bind('endUpload', this.generateImageCropper, this);
			
			// On génére une popup avec les différents formats d'images pour les miniatures
			//this.generateImageCropper();

        },
		
		generateImageCropper : function (data){
					
			
			// On créé un recadreur d'image (qui appellera Jcrop)
			this.preload([
				'http://localhost/plugin-upload/js/' + data
			]);
			
			this.thumbnailCropper1 = new ThumbnailCropper({id:'255', size: [150,150], img_size : [570, 350], url:"http://localhost/plugin-upload/js/" + data, type:"150x150"});
			this.thumbnailCropper2 = new ThumbnailCropper({id:'230', size: [260,180], img_size : [570, 350], url:"http://localhost/plugin-upload/js/" + data, type:"main_thumb"});
			this.thumbnailCropper3 = new ThumbnailCropper({id:'250', size: [300,120], img_size : [570, 350], url:"http://localhost/plugin-upload/js/" + data, type:"300x120"});
			
			
			// On créé la collection qui gérera les recadreurs d'images
			this.thumbnailcroppers = new ThumbnailCroppers();
			this.thumbnailcroppers.add([this.thumbnailCropper1, this.thumbnailCropper2, this.thumbnailCropper3]);
			
			// Et le rendu de la collection de recadreur
			this.thumbnailcroppersView = new ThumbnailCroppersView({ collection : this.thumbnailcroppers});
			this.thumbnailcroppersView.meta("someProperty", "http://localhost/plugin-upload/js/" + data);
			this.thumbnailcroppersView.render();
			
			// On passe en parametre
			
			// On créé la popup modal
			this.modalView = new ModalView();
			this.modalView.showModal();
			//this.thumbnailGeneratorView = new ThumbnailCropperView({ model : this.thumbnailCropper1 });
			
			this.modalView.bind('generateImages', this.generateImages, this);
			
			this.thumbnailcroppersView.bind('afterImagesGenerate', this.afterGenerateImage, this);
		
		
		},
		
		begincrop : function (){
			console.log("Ca commence à Crop !!!");
		},
		
		generateImages : function(){
			this.thumbnailcroppersView.generateImages();
			
		},
		
		preload : function(arrayOfImages) {
			$(arrayOfImages).each(function(){
				$('<img/>')[0].src = this;
				// Alternatively you could use:
				// (new Image()).src = this;
			});
		},
		
		afterGenerateImage: function(data){
			var image =  new Image({id:data.id, url:data.url, type:data.type, name: data.name});
			this.images.add(image);
			
			this.modalView.closeModal();
		}
	
	})
	
	//Lancement du programme
	mainModel = new MainModel();
	
	
})(jQuery);


