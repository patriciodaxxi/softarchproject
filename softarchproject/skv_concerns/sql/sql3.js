
nosql

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

Contributors

    Author: Peter Širka

You must see it

Total.js framework
Private packages for the whole team

It’s never been easier to manage developer teams with varying permissions and multiple projects. Learn more about Private Packages and Organizations…

how? learn more

    petersirka petersirka published 2 months ago
    5.0.3 is the latest of 53 releases
    github.com/petersirka/nosql

Collaborators list

    petersirka

Stats

    8 downloads in the last day
    43 downloads in the last week
    438 downloads in the last month
    No open issues on GitHub
    No open pull requests on GitHub

Try it out

    Test nosql in your browser.

Keywords

nosql, database, embed, embedded, db, binary
Dependencies

None
Dependents (7)

dashboard-management-server, ipblog, node-snmp-server, omega-models, and more

Hart is hiring. View more…
