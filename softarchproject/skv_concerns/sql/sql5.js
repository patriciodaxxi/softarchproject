Node.js NoSQL embedded database

NPM version NPM quality NPM downloads MIT License

IMPORTANT: the new version v5.0 has new methods than older version. The structure of database file is same.

    Live chat with professional support
    HelpDesk with professional support

    NEW: Online NoSQL embedded database explorer
    Documentation
    Supports views
    Supports backuping with filtering
    Supports binary files
    Supports simple filtering
    News on Twitter - @totalframework
    Total.js framework uses NoSQL embedded database

Installation

$ npm install nosql

Usage

    NoSQL Documentation

var NoSQL = require('nosql');
var db = NoSQL.load('/path/to/datbase.nosql');

// db === Database instance <https://docs.totaljs.com/latest/en.html#api~Database>

db.find().make(function(filter) {
	filter.where('age', '>', 20);
	filter.where('removed', false);
	filter.callback(function() {
		console.log(err, response);
	});
});

## Contributors

    Author: Peter Širka

You must see it

Total.js framework