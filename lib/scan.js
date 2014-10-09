var _ = require('lodash');
var th = require('thunkify');
var co = require('co');
var fs = require('fs');
var path = require('path');

function scan(options, cb) {
	_.defaults(options, {
		directory: process.cwd(),
		template: new RegExp('#TEMPLATE\\n'),
		encoding: 'base64'
	});

	var regex = new RegExp(options.template);
	co(readAny(options.directory, regex, options.encoding))(function(err, data) {
		if(err) return cb(err);
		cb(null, {
			data: data,
			encoding: options.encoding
		});
	});
}

function readFile(pth, regex, encoding) {
	return function *() {
		var result = {
			template: false
		};

		result.content = yield th(fs.readFile)(pth, 'utf8');
		if(regex.test(result.content)) {
			result.template = true;
			result.content = result.content.replace(regex, '');
		}

		result.content = new Buffer(result.content).toString(encoding);
		return result;
	};
}

function readDir(pth, regex, encoding) {
	return function *() {
		var result = {};

		var contents = yield th(fs.readdir)(pth);
		result.children = yield _.reduce(contents, function(sum, name) {
			sum[name] = readAny(path.join(pth, name), regex, encoding);
			return sum;
		}, {});

		return result;
	};
}

function readAny(pth, regex, encoding) {
	return function *() {
		var stats = yield th(fs.lstat)(pth);

		if(stats.isDirectory()) {
			return yield readDir(pth, regex, encoding);
		} else if(stats.isFile()) {
			return yield readFile(pth, regex, encoding);
		} else {
			return false;
		}
	};
}

module.exports = scan;