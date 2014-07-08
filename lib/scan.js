var _ = require('lodash');
var th = require('thunkify');
var co = require('co');
var fs = require('fs');
var path = require('path');

var fsthunk = {
	lstat: th(fs.lstat),
	readFile: th(fs.readFile),
	readdir: th(fs.readdir)
};

function scan(options, cb) {
	_.defaults(options, {
		directory: process.cwd(),
		template: new RegExp('#TEMPLATE\\n')
	});

	var regex = new RegExp(options.template);
	co(readAny(options.directory, regex))(cb);
}

function readFile(pth, regex) {
	return function *() {
		var result = {
			template: false
		};

		result.content = yield fsthunk.readFile(pth, 'utf8');
		if(regex.test(result.content)) {
			result.template = true;
			result.content = result.content.replace(regex, '');
		}

		result.content = new Buffer(result.content).toString('base64');
		return result;
	};
}

function readDir(pth, regex) {
	return function *() {
		var result = {};

		var contents = yield fsthunk.readdir(pth);
		result.children = yield _.reduce(contents, function(sum, name) {
			sum[name] = readAny(path.join(pth, name), regex);
			return sum;
		}, {});

		return result;
	};
}

function readAny(pth, regex) {
	return function *() {
		var stats = yield fsthunk.lstat(pth);

		if(stats.isDirectory()) {
			return yield readDir(pth, regex);
		} else if(stats.isFile()) {
			return yield readFile(pth, regex);
		} else {
			return false;
		}
	};
}

module.exports = scan;
