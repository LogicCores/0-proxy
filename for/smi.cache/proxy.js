
const FS = require("fs");
const SMI_CACHE = require("../../../../lib/smi.cache");


exports.app = function (options) {

    var cache = new SMI_CACHE.UrlProxyCache(options.cacheBasePath, {
		ttl: 5 * 60 * 1000,  // 5 Minutes
		verbose: false,
		debug: false
	});

    return function (req, res, next) {

        var url = options.sourceBaseUrl + req.params[0];

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

