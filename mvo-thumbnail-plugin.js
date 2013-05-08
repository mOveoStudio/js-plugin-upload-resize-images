/*
 *
 * FICHIER PRINCIPAL DE L'APPLICATION
 * 
 * Cette application sert a faciliter la creation de miniature au moment de l'upload
 * Elle se separera en 3 partie distincte (3 modules) :
 * 
 * 1) Le module d'upload qui permet de remplacer le input type="file" et de telecharger un fichier image en ajax.
 * Une barre de progression marquera l'avancee du telechargement
 * 
 * 2) Le module de selection des miniatures :
 * D'apres un même image il sera possible de générer plusieurs miniatures et de choisir pour chacune de ces miniatures
 * le recadrage.
 * @param image string : image d'origine
 * @param thumbs array : liste des tailles de recadrage
 * @return un Object contenant la liste des nouvelle coordonnees de recadrage pour chacune des miniatures
 * 
 * 3) Le module de tri des images d'une bibliotheque
 * @param images : liste des images
 */
(function (global) {

	global.myPlugin = global.myPlugin || {};
	
	myPlugin.init = init;
	
	function init(arr) {
		// Liste et paths des fichiers dependants
		require.config({
		  shim: {
			underscore: {
			  exports: '_'
			},
			jquery: {
			  exports: '$'
			},
			jqueryUI: {
					exports: "$",
					deps: ['jquery']
			},
			backbone: {
			  deps: ['underscore', 'jquery'],
			  exports: 'Backbone'
			},
			jcrop: {
				deps: ['jquery']
			}
		  },
		  paths: {
			jquery: 'assets/js/jquery-min',
			jqueryUI: 'assets/js/jquery-ui',
			text:'assets/js/text',
			underscore: 'assets/js/underscore-min',
			backbone: 'assets/js/backbone-min',
			jcrop: 'assets/js/jcrop'
		  }

		});

		// Chargement du fichier principale de l'app (app.js) et lancemement de l'initialisation
		require([
                    'jquery',
                    'underscore',
                    'backbone',
                    'src/models/main'
                  ], function($, _, Backbone, Main){
			
                        app = new Main(arr);
			
		});
	}
}(window));

