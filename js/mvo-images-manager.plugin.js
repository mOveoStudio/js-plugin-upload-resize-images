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
			
			console.log(this.get('coord'))
		
		}
	
	})
	
	// Collection de recadreur d'image
	window.ThumbnailCroppers = Backbone.Collection.extend({
		model:ThumbnailCropper
		
	
	})
	
	// View de la collection de recadreurs d'image
	window.ThumbnailCroppersView = Backbone.View.extend({
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
			//console.log("On change les coords : ", _this.meta('currentModel').get('coord'));
			_this.meta('currentModel').set('coord',e);
		
		},
		
		events : {
			
			// Au clic sur le menu de thumnails on change la colonne de gauche de la popup
			'click #nav-image-size a' : "changeTumbnail"
        },
		
		changeTumbnail : function(e) {
		
			destURL = $(e.target).attr('href').replace('#','');
			
			_this.meta('currentModel', _this.collection.get(destURL));
			
			currentCoord = _this.meta('currentModel').get('coord');
			currentSize = _this.meta('currentModel').get('size');
			
			console.log(_this.meta('currentModel'), " : ", _this.meta('currentModel').get('coord'));
			
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
			tmbnls = this.collection.toJSON();
			var renderedContent = this.template({ thumbnails : this.collection.toJSON()});
			
			//$(this.el).html(renderedContent);
			$(this.el).find("#nav-image-size").html(renderedContent);
			
			$(this.el).find("#cropped-container").html("<img src='"+this.meta("imgURL")+"' id='target'/>");
			
			_this = this;
			
			
			this.collection.each(function(model){
				
				var modelView = new ThumbnailCropperView({model : model});
				
			})
			
			this.meta('currentModel', this.collection.models[0]);
			
			
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
			this.collection.each(function(model){
			coord = model.get("coord");
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
			if(_this.meta("countReturn") >= _this.collection.length)
				_this.trigger("afterImagesGenerate",arr, $('#target').attr('src'));
		}
	
	
	})
	
	// View du recadreur d'image
	window.ThumbnailCropperView = Backbone.View.extend({
		el : $('#modals-container'),
		
		initialize : function() {
			

		},
		
		render : function(el){
			
			
		
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
            'click #generate-image' : function(){ 
						this.trigger('generateImages'); 
			},
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
	
	})
	
	// Vue principale. Détecte les actions utilisateurs sur les composants de la page HTML
	window.MainView = Backbone.View.extend({
	
	
	})
	
	// Modèle prinicipal. Il gère les instanciations des différents éléments de l'app
	// et écoute les trigger des autres modèles
	window.MainModel = Backbone.Model.extend({
		
		defaults:{
			url_images: "/",
			thumbs : null
		},
		
		
		initialize : function() {
			
			// On créé la collection qui gérera les images du plugin
			this.images = new Images();
			this.img1 = new Image({id:"250", url:"img/01.jpg", type:'main_thumb'});
			this.img2 = new Image({id:"630", url:"img/03.jpg", type:'main_thumb'});

			this.images.add([this.img1, this.img2]);
			
			// Et le rendu de la collection d'images
			this.view = new ImagesCollectionView({collection : this.images});
			this.view.render();
			
			// On créé la popup modal
			this.modalView = new ModalView();
			this.modalView.bind('generateImages', this.generateImages, this);
			

			
			// Détection des évènements utilisateurs
			var mainView = new MainView();
			
			// Manager de upload ficher
			this.uploader = new Uploader();
			this.uploaderView = new UploaderView({model : this.images});
			this.uploaderView.bind('endUpload', this.generateImageCropper, this);
			
			
			// On génére une popup avec les différents formats d'images pour les miniatures
			//this.generateImageCropper();

        },
		
		generateImageCropper : function (d){
			
			
			$('body').find(".progress-upload").hide();
			
			
			imgname = d.filename;
			imgsize = d.imagesize;
			
			if(this.get("thumbs") == null) return;
			
			// On créé la collection qui gérera les recadreurs d'images
			this.thumbnailcroppers = new ThumbnailCroppers();
			
			
			_.each(this.get("thumbs"), function(e){
			
				thumbnailCropper = new ThumbnailCropper({size: [e.h,e.w], img_size:imgsize, type:e.type});
				this.thumbnailcroppers.add(thumbnailCropper);
				
			},this)
			
			
			
			
			
			// Et le rendu de la collection de recadreur
			this.thumbnailcroppersView = new ThumbnailCroppersView({ collection : this.thumbnailcroppers});
			this.thumbnailcroppersView.meta("imgURL", this.get('url_images') + imgname);
			this.thumbnailcroppersView.meta("imgSize", [imgsize[0], imgsize[1]]);
			this.thumbnailcroppersView.render();
			
			this.thumbnailcroppersView.bind('afterImagesGenerate', this.afterGenerateImage, this);

			this.modalView.showModal();
			//this.thumbnailGeneratorView = new ThumbnailCropperView({ model : this.thumbnailCropper1 });
		
		
		
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
		
		afterGenerateImage: function(arr, temp){
			
			_.each(arr, function(e){
				var image =  new Image({id:e.id, url:e.url, type:e.type, name: e.name});
				console.log("ID de l'image : ", e.id)
				this.images.add(image);
			}, this)
			
			
			//Suppression du fichier temp
			console.log(temp);
			$.ajax({
				url: 'js/delete.php',  //server script to process data
				type: 'POST',
				data: { url : temp }
			});
			
			this.modalView.closeModal();
		}
	
	})
	
	//Lancement du programme
	mainModel = new MainModel({
		"url_images" : "js/",
		"thumbs" : [{
				h : "200",
				w : "350",
				type : "200x250"
			 },{
				h : "300",
				w : "300",
				type : "300x300"
			},{
				h : "260",
				w : "180",
				type : "main_thumb"
				
			}
			
			
		]
	});
	
	
})(jQuery);


