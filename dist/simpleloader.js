;(function($, window) {

    var resourcesCache = {},
        baseUrl = '',
        sufix = '';

    function getResource(url, callback) {

        var resource = resourcesCache[url];

        if (!resource) {

            resource = resourcesCache[url] = {
                url: url,
                deferred: $.ajax({
                    url: baseUrl + url + sufix,
                    dataType: 'text',
                    cache: true,
                    success: function(text) {
                        resource.code = text;
                    }
                })
            };

        }

        if (callback) {

            resource.deferred.state() === 'resolved' ? callback(resource) : $.when(resource.deferred).done(function() {
                callback(resource);
            });

        }

        return resource.deferred;

    }

    function processResourcesQue(resources, success, fail) {

        if (resources.length === 0) {
            success();
            return;
        }

        var currentResourceUrl = resources.shift(),
            method = 'get' + getFileType(currentResourceUrl);

        $.when(api[method](currentResourceUrl)).done(function() {

            resources.length > 0 ? processResourcesQue(resources, success, fail) : success();

        }).fail(fail);

    }

    function getFileType(path) {

        var extension = path.split('.').pop().split('?').shift(),
            typeMap = {
                js: 'Script',
                css: 'CSS',
                jpg: 'Image',
                png: 'Image',
                gif: 'Image'
            };

        return typeMap[extension] || 'Script';

    }

    function load(params) {

        var resourceUrls = [];

        $.each([params.load, params.test && params.yep, !params.test && params.nope], function(i, item) {

            if (item) {
                $.isArray(item) ? $.merge(resourceUrls, item) : resourceUrls.push(item);
            }

        });

        $.each(resourceUrls, function(i, url) {
            getResource(url);
        });

        processResourcesQue(resourceUrls, function() {
            params.complete && params.complete();
        }, function() {
            params.fail && params.fail();
        });

    }

    var api = {

        getScript: function(url, callback) {

            return getResource(url, function(resource) {

                if (resource.code) {

                    (window.execScript || function(data) {
                        window['eval'].call(window, data);
                    })($.trim(resource.code));

                    delete resource.code;
                }

                callback && callback();

            });

        },

        getCSS: function(url, callback) {

            return getResource(url, function(resource) {

                if (resource.code) {

                    $('<link>').appendTo($('head')).attr({type: 'text/css', rel: 'stylesheet'}).attr('href', baseUrl + url + sufix);
                    delete resource.code;

                }

                callback && callback();

            });

        },

        getImage: function(url, callback) {

            return getResource(url, callback);

        },

        setBaseUrl: function(url) {

            baseUrl = url;

        },

        setSufix: function(userSufix) {

            sufix = userSufix;

        },

        preload: getResource

    };

    $.extend(load, api);

    $.wk = $.wk || {};
    $.wk.load = load;

})(window.jQuery || window.Zepto, window);
