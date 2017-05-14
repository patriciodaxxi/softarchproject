/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START app]
'use strict';

var fs = require('fs');

const express = require('express');
const app = express();
var bodyParser = require('body-parser');

app.get('/', (req, res) => {
	console.log('came here');
	res.render('file_upload.html');
	//res.render('index.php');
});

app.get('/upload', (req, res) => {
	console.log('file upload');
	console.log(req.files);
	res.send('done');
	// fs.readFile(req.files.displayImage.path, function (err, data) {
	  
	//   var newPath = __dirname + "/uploads/"+req.files.displayImage.name;
	//   fs.writeFile(newPath, data, function (err) {
	//     //res.redirect("back");
	//     res.send(data);
	//   });
	// });
});

// set up our express application
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('views', __dirname + '/views');
app.use(express.static(__dirname));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html'); // set up ejs for templating

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
