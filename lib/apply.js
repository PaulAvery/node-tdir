var _ = require('lodash');
var th = require('thunkify');
var co = require('co');
var fs = require('fs');
var path = require('path');

var fsthunk = {
	mkdir: function(path) {
		return function(cb) {
			fs.mkdir(path, function(e) {
				if(!e || e.code === 'EEXIST') {
					cb();
				} else {
					cb(e);
				}
			});
		};
	},
	writeFile: th(fs.writeFile)
};

function apply(options, cb) {
	_.defaults(options, {
		directory: process.cwd(),
		templating: _.identity
	});

	if(!options.template) {
		throw new Error('tdir.apply requires a template to be set!');
	}

	co(applyAny(options.directory, options.template, options.templating))(cb);
}

function applyFile(pth, content, templating) {
	var data = new Buffer(content.content, 'base64');
	if(content.template) {
		data = new Buffer(templating(data.toString('utf8')), 'utf8');
	}

	return function *() {
		yield fsthunk.writeFile(pth, data);
	};
}

function applyFolder(pth, children, templating) {
	return function *() {
		yield fsthunk.mkdir(pth);
		yield _.reduce(children, function(result, child, key) {
			result.push(applyAny(path.join(pth, key), child, templating));
			return result;
		}, []);
	};
}

function applyAny(pth, data, templating) {
	if(data.children) {
		return applyFolder(pth, data.children, templating);
	} else {
		return applyFile(pth, data, templating);
	}
}

module.exports = apply;
