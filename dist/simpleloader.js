;(function($, window){

	"use strict";

	var resourcesCache = {},
		baseUrl = '',
		sufix = '';

	function getResource(url, ajaxParams, callback){

		var resource = resourcesCache[url];

		if (!resource) {

			resource = { 'url': url, 'deferred': $.ajax($.extend({'url': baseUrl + url + sufix }, ajaxParams ))};
			resourcesCache[url] = resource;

		}

		if (callback){

			if ( resource.deferred.state() === 'resolved' ){ callback(); return; }
			$.when(resource.deferred).done(function(){ callback(); });

		}

	}

	function resolveResources(resources){

		var currentResource = resources.shift();

		api['get' + getFileType(currentResource.url)](currentResource.url);

		$.when(resourcesCache[currentResource.url].deferred).done(function(){

			currentResource.deferred.resolve();
			if (resources.length) { resolveResources(resources); }

		}).fail(function(){

			currentResource.deferred.reject();

		});

	}

	function getFileType(path){

		var extension = path.split('.').pop().split('?').shift(),
			type = '';

		switch (extension){
			case 'js': type = 'Script'; break;
			case 'css': type = 'CSS'; break;
			case 'jpg': type = 'Image'; break;
			case 'png': type = 'Image'; break;
			case 'gif': type = 'Image'; break;
			default: type = 'Script';
		}

		return type;

	}

	function load(params){

		var deferreds = [],
			resourceUrls = [],
			resourceCanidates = [],
			appendResourceUrls = function( param ){

				$.isArray(param) ? $.merge(resourceUrls, param) : resourceUrls.push(param);

			};

		if (params.load) { appendResourceUrls( params.load ); }
		if (params.test && params.yep){ appendResourceUrls( params.yep ); }
		if (!params.test && params.nope){ appendResourceUrls( params.nope ); }

		$.each(resourceUrls, function(i, url){

			var deferred = $.Deferred();
			deferreds.push(deferred);
			resourceCanidates.push({'url': url, 'deferred': deferred});

		});

		resolveResources(resourceCanidates);

		$.when.apply(window,deferreds).done(function(){
			params.complete && params.complete();
		}).fail(function(){
			params.fail && params.fail();
		});

	}

	var api ={

		getScript: function(url, callback){

			getResource(url, {dataType: "script", cache: true}, callback);

		},

		getCSS: function(url, callback){

			getResource(url, {cache: true }, callback);

			$.when(resourcesCache[url].deferred).done(function(){
				$('<link>').appendTo($('head')).attr({type : 'text/css', rel : 'stylesheet'}).attr('href', baseUrl + url + sufix);
			});

		},

		getImage: function(url, callback){

			getResource(url, {}, callback);

		},

		setBaseUrl: function(url){

			baseUrl = url;

		},

		setSufix: function(userSufix){

			sufix = userSufix;

		}

	};

	$.extend(load, api);

	$.wk = $.wk || {};
	$.wk.load = load;

})(window.jQuery || window.Zepto, window);