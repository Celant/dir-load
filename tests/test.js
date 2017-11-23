/**
 * test.js - simple test
 * @author Josh Harris <me@celant.co.uk>
 * @original Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

var _ = require("lodash");
var RequireDir = require("../src");
var path = require("path");

/* constants */

var EXPECTED_MODULES = ["a", "child/a", "another-child/c"];
var EXPECTED_FILTERED_MODULES = ["a", "child/a"];

/* module exports */

module.exports = {

	/**
	* Sync text
	*/
	"sync": function(test) {

		test.expect(2);

		var modules = new RequireDir(__dirname + "/modules", {
			loadAsync: false
		});

		test.ok(_.isEqual([], _.difference( _.map(modules.requireAllEx(), "relative"), EXPECTED_MODULES)), "All modules are properly loaded");
		test.equal("child hello", modules.require("child/a" ), "Can require child module");

		test.done();
	},

	/**
	* Async test
	*/
	"async": function(test) {

		test.expect(7);

		var modules = new RequireDir(__dirname + "/modules", {
			loadAsync: true
		});

		modules.on("next", function(m) {
			test.ok(m.module, m.relative + " module loaded");
			test.ok( _.includes(EXPECTED_MODULES, m.relative), "Loaded expected module " + m.relative );
		});

		modules.on("done", function() {
			test.ok(_.isEqual([], _.difference( _.map(modules.requireAllEx(), "relative"), EXPECTED_MODULES)), "All modules are properly loaded");
			test.done();
		});
	},

	/**
	* Relative path
	*/
	"relative path": function(test) {

		test.expect(1);

		var modules = new RequireDir(__dirname + "/../tests/modules");

		test.ok(_.isEqual([], _.difference( _.map(modules.requireAllEx(), "relative"), EXPECTED_MODULES)), "All modules are properly loaded");
		test.done();
	},

	/**
	 * Filter test
	 */
	"filter": function(test) {

		test.expect(1);

		var modules = new RequireDir(__dirname + "/modules", {
			loadAsync: false,
			filter: function(item) {
				if (path.basename(item.path) === "c.js") {
					return false;
				}
				return true;
			}
		});

		test.ok(_.isEqual([], _.difference( _.map(modules.requireAllEx(), "relative"), EXPECTED_FILTERED_MODULES)), "Filtered out modules are properly loaded");

		test.done();
	},
};

