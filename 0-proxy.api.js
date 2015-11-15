
exports.forLib = function (LIB) {

    var exports = {};

    // TODO: Load adapters as needed on demand
    
    exports.adapters = {
        "smi.cache": require("./for/smi.cache").forLib(LIB)
    }

    return exports;
}
