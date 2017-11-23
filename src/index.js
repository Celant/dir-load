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
		includedExtensions: [".js", ".json"],
		loadAsync: false,
		loadRecursive: true,
		filter: undefined
	}, options);

	var filterWrapper = function(file) {
		if (self.options.filter && !self.options.filter(file)) {
			return false;	
		}
		return _.includes(self.options.includedExtensions, path.extname(file.path));
	};

	// Loaded modules 
	self.modules = [];

	/**
	* Process collected modules and require them
	*/
	var process = function(files) {
		_.each(files, function(f) {
			var p = f.path;
			var relative = p.substring(basePath.length + 1);
			relative = relative.replace(/\.(.*?)$/, ""); // Remove file extension
			var module = { "relative": relative, "module": require(p) };
			self.modules.push(module);
			self.emit("next", module);
		});

		self.emit("done", self.modules);
	};

	// Find and process files Synchronously
	if (!self.options.loadAsync) {
		var files = klawSync(basePath, {
			nodir: true,
			filter: filterWrapper
		});
		return process(files);
	}


	// Files for async processing
	var files = [];

	klawRedux(basePath, {
		nodir: true,
		filter: filterWrapper
	})
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
	return _.find(this.modules, { "relative": name }).module;
};		
/**
 * Require all scanned modules and return array of them
 */
RequireDir.prototype.requireAll = function() {
	return _.map(this.modules, "module");
};

/**
 * Require all modules and return Array of objects
 */
RequireDir.prototype.requireAllEx = function() {
	return this.modules;
};


/* module exports */

module.exports = RequireDir;


