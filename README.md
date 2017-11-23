DirLoad
==========

[![Build Status](https://travis-ci.org/Celant/dir-load.svg?branch=master)](https://travis-ci.org/Celant/dir-load) [![NPM version](https://badge.fury.io/js/dir-load.svg)](http://badge.fury.io/js/dir-load)

Dynamically find and require Node.js modules from the filesystem.

Intro
-----

For when you need to dynamically scan a directory on the filesystem, and load (require) all of the modules (.js and .json files).
A lot of boilerplate code needs to be written to achieve this. You need to walk the filesystem recursively, filter out any files
which aren't actual modules, and then iterate and load each module. `DirLoad` does all of this for you, and more. When provided
with a base directory, it will recursively traverse it for any modules, which it will require and then pass back to you as an object
in the format of `{ "[relative path]": [module] }`.

Installation
------------

```bash
$ npm install --save dir-load
```

Usage
-----

### new DirLoad(directory, [options])

Returns an object that iterates through `directory` and loads all modules it can find.

- `directory`: (`string`, required): The directory to search for modules in.
- `options`: (`object`, default: `undefined`): An object containing any of the following options:
  - `loadAsync`: (`bool`, default: `false`): Specify whether or not to load modules asynchronously
  - `loadRecursive`: (`bool`, default: `true`): Should recursively traverse directories, or only search top-most directory
  - `includedExtensions`: (`array`, default: `[".js", ".json"]`): Which filetypes to accept as modules when searching
  - `filter`: (`function`, default: `undefined`): Function that gets one argument fn({path: '', stats: {}}) and returns true to include or false to exclude the item

##### Load synchronously
```javascript
var DirLoad = require('dir-load');

var modules = new DirLoad(__dirname + '/modules');

/* Returns an array of the loaded modules */
console.log( modules.requireAll() );

/* Retrieve all the modules as an array of objects in the format of [{"relative": [relativePath], "module": [loadedModule]}] */
console.log( modules.requireAllEx() );

/* Retrieve a single module if you know it's relative path */
console.log( modules.require('modules/a') );
```

##### Load asynchronously
If you're loading asynchronously, DirLoad will emit two different events. `next` will be emitted when a single module is loaded, and `done` will
be emitted when all modules have been loaded.
 
```javascript
var DirLoad = require('dir-load');

var modules = new DirLoad(__dirname + '/modules', {
    loadAsync: true
});

/* Single module loaded */
modules.on('next', function(module) {
    console.log(module.relative, module.module);
});

/* All modules loaded */
modules.on('done', function(allModules) {
    console.log(allModules);
});
```

#### Filters
You might want to apply a filter to only load specific modules. You can do that by passing a `filter` function into the options.

```javascript
var DirLoad = require('dir-load');

var modules = new DirLoad(__dirname + '/modules', {
    filter: function(item) {
        if (path.basename(item.path) === "c.js") {
            // Exclude the module if it's file name is "c.js"
            return false;
        }
        return true;
    }
});

/* Returns an array of the loaded modules */
console.log( modules.requireAll() );

/* Retrieve all the modules as an array of objects in the format of [{"relative": [relativePath], "module": [loadedModule]}] */
console.log( modules.requireAllEx() );

/* Retrieve a single module if you know it's relative path */
console.log( modules.require('modules/a') );
```

#### Author
* [Josh Harris](https://github.com/Celant/)

#### Original Concept
* [Yaroslav Pogrebnyak](https://github.com/yyyar/)
