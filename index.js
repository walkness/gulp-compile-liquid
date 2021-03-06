var gutil = require('gulp-util');
var through = require('through2');
var extend = require('util')._extend;

var Liquid = require("liquidjs");


function liquid(opts) {

	var options = opts || {};

  var engine = new Liquid(opts);

	return through.obj(function (file, enc, cb) {
		var _data = options.data || {};
		var _that = this;

		if (file.isNull()) {
			_that.push(file);
			return cb();
		}

		if (file.isStream()) {
			_that.emit('error', new gutil.PluginError('gulp-compile-liquid', 'Streaming not supported'));
			return cb();
		}

		try {
			var fileContents = file.contents.toString();

			// Enable gulp-data usage, Extend default data with data from file.data
			if(file.data){
				_data = extend(_data, file.data);
			}

			if (typeof options.dataEach === 'function') {
				_data = options.dataEach(_data, file);
			}

		} catch (err) {
			_that.emit('error', new gutil.PluginError('gulp-compile-liquid', err));
		}

		engine
		.parseAndRender(fileContents, _data)
		.then(function(result) {
			file.contents = new Buffer(result);
			_that.push(file);
			cb();
		})
		.catch(function(err) {
			_that.emit('error', new gutil.PluginError('gulp-compile-liquid', err));
			cb();
		});
	});
}

// Expose the Liquid object
liquid.Liquid = Liquid;

module.exports = liquid;
