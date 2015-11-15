
exports.forLib = function (LIB) {

    var exports = {};

	exports.app = function (options) {
	
		var cache = null;
	
	    return function (req, res, next) {
	
	    	var uri = req.params[0];
	    	var uriParts = uri.substring(1).split("/");
	    	var hostname = uriParts.shift();
	    	uri = "/" + uriParts.join("/");
	
	    	if (!options.routes[hostname]) {
	    		console.log("Warning: No route configured for hostname '" + hostname + "'!");
	    		res.writeHead(404);
	    		res.end("Not Found");
	    		return;
	    	}
	    	
	    	if (typeof options.routes[hostname] === "string") {
	    		options.routes[hostname] = {
	    			"baseUrl": options.routes[hostname]
	    		};
	    	}
	    	options.routes[hostname].headers = options.routes[hostname].headers || {};
	
	        var url = options.routes[hostname].baseUrl + uri;
			if (!cache) {
				const SMI_CACHE = require("../../../../lib/smi.cache");
	
			    cache = new SMI_CACHE.UrlProxyCache(options.cacheBasePath, {
					ttl: 5 * 60 * 1000,  // 5 Minutes
					verbose: false,
					debug: false
				});
			}
	
	        return cache.get(url, {
				loadBody: false,
				nohead: true,
				headers: options.routes[hostname].headers,
				useExistingOnError: true
			}, function(err, response) {
				if (err) return next(err);
	
				try {
	    			// TODO: Add more of our own cache control headers and respond
	    			//       according to what client requested.
	    			res.writeHead(200, {
	    			    "Content-Type": response.headers["content-type"] || "",
	    			    "Etag": response.etag || ""
	    			});
	    
	                return LIB.fs.createReadStream(response.cachePath).pipe(res);
	
				} catch (err) {
				    return next(err);
				}
			});
	    }
	}

	return exports;
}
