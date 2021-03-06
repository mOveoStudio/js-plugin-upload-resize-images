define([
    'underscore'
], function(_) {
JST = {};

// Template module Thumbnail
JST['template/thumbnailsModule'] = _.template(
        '<div id="moduleThumbnail">\
		<!--<div id="myModal" class="modal hide fade bigModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">-->\
		<div>\
                <div class="modal-header">\
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
		<h4 id="myModalLabel">Création des miniatures</h4>\
		</div>\
		<div class="modal-body" id="cropped-body">\
                        <div id="target-cropped-container"></div>\
                        <div class="row-fluid">\
                                <div class="span9">\
                                        <div id="cropped-container"></div>\
                                </div>\
                                <div class="span3">\
                                <h5><i class="icon-th"></i> Tailles miniatures</h5>\
                                <ul class="nav nav-pills nav-stacked" id="nav-image-size">\
                                </ul>\
                                </div>\
                        </div>\
		</div>\
		<div class="modal-footer">\
		<button class="btn btn-primary" id="generate-image">Générer les images</button>\
		</div>\
		</div>\
	</div>'
);

// Template liste des thumbnails
JST['template/thumbnailsList'] = _.template(
        '<% $id = 0 %>\
        <% _.each(thumbnails, function(soupiere) { %>\
        <li <%if($id==0) {%>class="active"<%} %>><a href="#<%= soupiere.id %>"><%= soupiere.size[0] %> x <%= soupiere.size[1] %></a></li>\
        <% $id ++;%>\
        <% }); %>'
);

// Template zone de crop
JST['template/thumbnailCropZone'] = _.template(
    '<img src="<%= url %>" id="target">'
);

// Template liste des images pour tri
JST['template/imagesCollection'] = _.template(
'<ul id="images-container" class="thumbnails">\
    <% _.each(images, function(doc) { %>\
          <%if (doc.type == "main_thumb") {%>\
          <li class="span3" id="<%= doc.id %>" attr-id="<%= doc.id %>"><img src="<%= doc.url %>"></li>\
          <%}%>\
    <% }); %>\
</ul>'
);

// Template module Upload
JST['template/uploaderModule'] = _.template(
                                '<div id="moduleUpload" class="formfileupload">\
                                <div class="row">\
                                <div class="span3">\
                                <div class="fileupload fileupload-new" data-provides="fileupload">\
                                        <span class="btn btn-file btn-primary"><span class="fileupload-new"><i class="icon-upload icon-white"></i> Upload une nouvelle image</span><input type="file" id="fileUpload" name="fileUpload"/></span>\
                                        <span class="fileupload-preview"></span>\
                                </div>\
                                </div>\
                                <div class="span9">\
                                <div class="progress-upload">\
                                <div class="progress progress-striped active">\
                                        <div class="bar" style="width: 0%;"></div>\
                                </div>\
                                <p class="text"><small>fichier : monFichier.jpg // en chargement : <span class="percentage">10%</span></small></p>\
                                </div>\
                                </div>\
                                </div>\
                                <input type="button" value="Upload" />\
                                <!--<a href="#myModal" role="button" class="btn btn-primary" data-toggle="modal"><i class="icon-upload icon-white"></i> Upload une nouvelle image</a>-->\
                        </div>'
    
)

return JST;
});