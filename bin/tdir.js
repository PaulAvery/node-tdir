#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var pkg = require('../package.json');
var tdir = require('../index.js');

program
	.version(pkg.version);

program
	.command('scan [directory]')
	.description('Create a template of the current directory')
	.option('-t, --template <template-string>', 'set the template detection regex')
	.option('-o, --output <file>', 'File to write the output to')
	.option('-e, --encoding <encoding>', 'Encoding to use for the output (default base64)')
	.action(function(directory, ctx) {
		tdir.scan({
			directory: directory,
			template: ctx.template ? new RegExp(ctx.template) : undefined,
			encoding: ctx.encoding ? ctx.encoding : undefined
		}, function(err, contents) {
			if(err) throw err;
			var output = JSON.stringify(contents, 0, 2);

			if(!ctx.output) {
				console.log(output);
			} else {
				fs.writeFile(ctx.output, output);
			}
		});
	});

program
	.command('apply <template>')
	.description('Restore a template. To use file-based templating, use this module programatically')
	.option('-d, --directory <directory>', 'Directory to apply the template to')
	.action(function(template, ctx) {
		tdir.apply({
			template: JSON.parse(fs.readFileSync(template, 'utf8')),
			directory: ctx.directory
		});
	});

program.parse(process.argv);
