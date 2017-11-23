/**
 * index.js - RequireDir
 * @author Josh Harris <me@celant.co.uk>
 * @original Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

var _ = require("lodash");
var path = require("path");
var klawSync = require("klaw-sync");
var klawRedux = require("klaw-redux");
var util = require("util");
var EventEmitter = require("events").EventEmitter;


/* RequireDir constructor */
var RequireDir = function(base, options) {

	var self = this;

	// Base scanning path
	var basePath = self.basePath = path.normalize(base);

	// Options
	self.options = _.merge({
		includedExtensions: [".js"],
		loadAsync: false,
		loadRecursive: true,
		filter: function(file) {
			return _.includes(self.options.includedExtensions, path.extname(file.path));
		}
	}, options);

	// Loaded modules 
	self.modules = {};

	/**
	* Process collected modules and require them
	*/
	var process = function(files) {
		_.each(files, function(f) {
			var p = f.path;
			var relative = p.substring(basePath.length + 1);
			relative = relative.replace(/\.(.*?)$/, ""); // Remove file extension
			self.modules[relative] = require(p);
			self.emit("next", relative, self.modules[relative]);
		});

		self.emit("done", self.modules, _.values(self.modules));
	};

	// Find and process files Synchronously
	if (!self.options.loadAsync) {
		var files = klawSync(basePath, { nodir: true, filter: self.options.filter });
		return process(files);
	}


	// Files for async processing
	var files = [];

	klawRedux(basePath, { nodir: true, filter: self.options.filter })
		.on("data", function(item) {
			files.push(item);
		})
		.on("end", function() {
			process(files);
		})
		.on("error", function(err, item) {
			console.error(err.message);
			console.error(item.path);
		});
};


/* Inherit event emitter */

util.inherits(RequireDir, EventEmitter);


/* Methods */

/**
 * Require module by relative path
 */
RequireDir.prototype.require = function(name) {
	return this.modules[name];
};

/**
 * Require all scanned modules and return list of them
 */
RequireDir.prototype.requireAll = function() {
	return _.values(this.modules);
};

/**
 * Require all modules and return object
 * (relativePath) -> (module)
 */
RequireDir.prototype.requireAllEx = function() {
	return this.modules;
};


/* module exports */

module.exports = RequireDir;


