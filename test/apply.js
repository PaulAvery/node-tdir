var th = require('thunkify');
var scan = th(require('../').scan);
var apply = th(require('../').apply);
var mock = require('mock-fs');
var fs = require('fs');

describe('The apply function', function() {
	var templates={};
	beforeEach(function *() {
		mock({
			'some/directory': {
				'file.txt': 'Content of some/directory/file.txt',
				'anotherone': 'More Content',
				'inside': {
					'content': '#TEMPLATE\nand stuff',
					'empty-dir': {

					},
					'empty-dir-2': {

					}
				}
			}
		});

		templates.utf8 = yield scan({encoding: 'utf8'});
		templates.base64 = yield scan({encoding: 'base64'});
		mock({});
	});

	afterEach(function() {
		mock.restore();
	});

	it('should throw on missing template', function (done) {
		apply()(function(err) {
			err.must.be.an(Error);
			done();
		});
	});

	it('creates the correct files', function *() {
		yield apply({template: templates.utf8});
		fs.existsSync('some/directory/file.txt').must.be.true();
		fs.lstatSync('some/directory/file.txt').isFile().must.be.true();
		fs.existsSync('some/directory/anotherone').must.be.true();
		fs.lstatSync('some/directory/anotherone').isFile().must.be.true();
		fs.existsSync('some/directory/inside/content').must.be.true();
		fs.lstatSync('some/directory/inside/content').isFile().must.be.true();
	});

	it('creates the correct folders', function *() {
		yield apply({template: templates.utf8});
		fs.existsSync('some/directory/inside/empty-dir').must.be.true();
		fs.lstatSync('some/directory/inside/empty-dir').isDirectory().must.be.true();
		fs.existsSync('some/directory/inside/empty-dir-2').must.be.true();
		fs.lstatSync('some/directory/inside/empty-dir-2').isDirectory().must.be.true();
	});

	describe('should run templates', function() {
		it('through supplied function', function *() {
			yield apply({
				template: templates.utf8,
				templating: function(content) {
					return content+content;
				}
			});

			fs.readFileSync('some/directory/inside/content', 'utf8').must.be('and stuffand stuff');
		});

		it('as noop by default', function *() {
			yield apply({template: templates.utf8});
			fs.readFileSync('some/directory/inside/content', 'utf8').must.be('and stuff');
		});
	});

	describe('should restore with the correct encoding', function () {
		it('if encoding is utf8', function *() {
			yield apply({template: templates.utf8});
			fs.readFileSync('some/directory/file.txt', 'utf8').must.be('Content of some/directory/file.txt');
		});

		it('if encoding is base64', function *() {
			yield apply({template: templates.base64});
			fs.readFileSync('some/directory/file.txt', 'utf8').must.be('Content of some/directory/file.txt');
		});
	});
});