
const FS = require("fs");
const SMI_CACHE = require("../../../../lib/smi.cache");


exports.app = function (options) {

    var cache = new SMI_CACHE.UrlProxyCache(options.cacheBasePath, {
		ttl: 5 * 60 * 1000,  // 5 Minutes
		verbose: false,
		debug: false
	});

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

        var url = options.routes[hostname] + uri;

        return cache.get(url, {
			loadBody: false,
			nohead: true,
//			headers: req.headers,
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
    
                return FS.createReadStream(response.cachePath).pipe(res);

			} catch (err) {
			    return next(err);
			}
		});
    }
}
