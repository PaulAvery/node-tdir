var th = require('thunkify');
var scan = th(require('../').scan);
var mock = require('mock-fs');

describe('The scan function', function() {
	beforeEach(function() {
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
	});

	afterEach(function() {
		mock.restore();
	});

	it('should default to process.cwd()', function *() {
		var result = yield scan({});

		result.data.children.some.must.exist();
	});

	it('should accept another directory', function *() {
		var result = yield scan({directory: 'some/directory'});

		result.data.children['file.txt'].must.exist();
	});

	it('should replicate the file structure correctly', function *() {
		var result = yield scan({encoding: 'utf8', template: new RegExp('')});

		result.data.children.some.children.directory.children['file.txt'].must.exist();
		result.data.children.some.children.directory.children['file.txt'].content.must.be('Content of some/directory/file.txt');
		result.data.children.some.children.directory.children.anotherone.must.exist();
		result.data.children.some.children.directory.children.anotherone.content.must.be('More Content');
		result.data.children.some.children.directory.children.inside.children.content.must.exist();
		result.data.children.some.children.directory.children.inside.children.content.content.must.be('#TEMPLATE\nand stuff');
		result.data.children.some.children.directory.children.inside.children['empty-dir'].must.exist();
		result.data.children.some.children.directory.children.inside.children['empty-dir'].children.must.exist();
		result.data.children.some.children.directory.children.inside.children['empty-dir-2'].must.exist();
		result.data.children.some.children.directory.children.inside.children['empty-dir-2'].children.must.exist();
	});

	describe('should find templates', function () {
		it('by default', function *() {
			var result = yield scan({encoding: 'utf8'});

			result.data.children.some.children.directory.children['file.txt'].template.must.be.false();
			result.data.children.some.children.directory.children.anotherone.template.must.be.false();
			result.data.children.some.children.directory.children.inside.children.content.template.must.be.true();
			result.data.children.some.children.directory.children.inside.children.content.content.must.be('and stuff');
		});

		it('for regular expression', function *() {
			var result = yield scan({encoding: 'utf8', template: new RegExp('Content')});

			result.data.children.some.children.directory.children['file.txt'].template.must.be.true();
			result.data.children.some.children.directory.children.anotherone.template.must.be.true();
			result.data.children.some.children.directory.children.inside.children.content.template.must.be.false();
			result.data.children.some.children.directory.children.inside.children.content.content.must.be('#TEMPLATE\nand stuff');
		});
	});

	it('should default to base64', function *() {
		var result = yield scan({});

		result.encoding.must.be('base64');

		var content = result.data.children.some.children.directory.children['file.txt'].content;
		new Buffer(content, 'base64').toString('utf8').must.be('Content of some/directory/file.txt');
	});

	it('should respect alternate encodings', function *() {
		var result = yield scan({encoding: 'utf8'});

		result.encoding.must.be('utf8');
		result.data.children.some.children.directory.children['file.txt'].content.must.be('Content of some/directory/file.txt');
	});
});