/*
 * LES VUES CONCERNANT L'UPLOAD DES FICHIERS
 */

define([
  'underscore',
  'backbone',
  'jquery',
  'src/templates/templates'
], function(_, Backbone, $, JST) {
    

    var uploaderView = Backbone.View.extend({
        
            initialize : function() {

             _.bindAll(this);   

            },

            events : {
                    "change :file" : 'inputFileChange'
            },

            // Lorsque le champ uploadfile est modifie
            inputFileChange : function(){
                    var fileInput = $(".formfileupload").find('#fileUpload')[0];
                    var file = fileInput.files[0];
                    var formData = new FormData();
                    formData.append('fileUpload',file);

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
    
    return uploaderView;
});