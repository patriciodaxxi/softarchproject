
node.io

node.io is a distributed data scraping and processing framework

    Jobs are written in Javascript or Coffeescript and run in Node.JS - jobs are concise, asynchronous and FAST
    Includes a robust framework for scraping, selecting and traversing data from the web (choose between jQuery or SoupSelect)
    Includes a data validation and sanitization framework
    Easily handle a variety of input / output - files, databases, streams, stdin/stdout, etc.
    Speed up execution by distributing work across multiple processes and (soon) other servers
    Manage & run jobs through a web interface

Follow @nodeio or visit http://node.io/ for updates.
Scrape example

Let's pull the front page stories from reddit

require('node.io').scrape(function() {
    this.getHtml('http://www.reddit.com/', function(err, $) {
        var stories = [];
        $('a.title').each(function(title) {
            stories.push(title.text);
        });
        this.emit(stories);
    });
});

If you want to incorporate timeouts, retries, batch-type jobs, etc. head over to the wiki for documentation.
Built-in modules

node.io comes with some built-in scraping modules.

Find the pagerank of a domain

$ echo "mastercard.com" | node.io pagerank
   => mastercard.com,7

..or a list of URLs

$ node.io pagerank < urls.txt

Quickly check the http code for each URL in a list

$ node.io statuscode < urls.txt

Grab the front page stories from reddit

$ node.io query "http://www.reddit.com/" a.title

Installation

To install node.io, use npm

$ npm install -g node.io

If you do not have npm or Node.JS, see this page.
Getting started

If you want to create your own scraping / processing jobs, head over to the wiki for documentation, examples and the API.

node.io comes bundled with several modules (including the pagerank example from above). See this page for usage details.
Roadmap

    Finish writing up the wiki
    More tests & improve coverage
    Add distributed processing
    Fix up the http://node.io/ page
    Cookie jar for persistent cookies
    Speed improvements

history.md lists recent changes.

If you want to contribute, please fork/pull.

If you find a bug, please report the issue here.
Credits

node.io wouldn't be possible without

    ry's node.js
    tautologistics' node-htmlparser
    harryf's soupselect
    kriszyp's multi-node
