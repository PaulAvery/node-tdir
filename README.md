Directory Templating
====================
This module allows you to convert a directory structure into a template. The template is a simple JavaScript object, which can then be used to recreate the original folder.
In addition, files may be flagged as templates, making this module ideal for bootstrapping things.

This module makes use of generators, so you need a node version `>=0.11` and run your application with the `harmony` flag.
Install the module globally via `npm install -g tdir` or locally via `npm install tdir`.


CLI
---
If globally installed, the module provides a command line interface, exposing two commands.

### tdir scan [directory]
Scans a directory (the current working directory by default) and outputs the resulting template on the commandline.
Accepts the following options:
* `-o, --output <file>`: A file into which to write the generated data
* `-t, --template <regex>`: The regular expression by which to identify if a file should be treated as a template. Defaults to `#TEMPLATE\n`. The first matched occurence will be removed from the resulting file.

### tdir apply <template>
Takes a template file (as generated by `tdir scan`) and applies it to a directory (defaults to cwd as well). No file based templating is applied by this command.
Accepts the following options:
* `-d, --directory <dir>`: The directory to apply the file to

Programmatic API
----------------
If you require the module from within your application, it provides an object with methods corresponding to the above commands.

### scan(options, cb)
The possible options are:
* `template`: A regular expression object, see the `-t` option above.
* `directory`: The path to the directory which should be scanned (Defaults to `process.cwd()`)

The callback should adhere to node standards (taking an error as its first argument) and will be called with the template object as its second argument.

### apply(options, cb)
The possible options are:
* `template`: A template object
* `directory`: The target directory (Defaults to `process.cwd()`)
* `templating` (optional): A function, which will be called with a template files contents as its only argument. Its return value will be written to the output file.

The callback will be called as soon as all data is written and will take an error as its only argument.