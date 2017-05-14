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

//consider inputting the legends file for more compatibility
//then remember to change in regex also
var concern_color_mapping = {
	"red": "graphics",
	"green": "gui",
	"blue": "io",
	"yellow": "networking",
	"chocolate2": "sound",
	"aquamarine": "sql",
	"black": "no_match",
};

function file () {
 	this.name = "",
 	this.parent_name = null,
 	this.file_path = "",
	this.version = "",
	this.isInA = false,
	this.isInB = false,
	this.isDir = false,
	this.isFile = true,
	this.sloc = 0,
	this.file_size = 0,
	this.concern_color = "black",
	this.concern_name = "no_match",
	this.children = []
}
var all_files_2_2 = [];
var all_files_2_7 = [];
var sloc_2_2 = [];
var sloc_2_7 = [];
var apache_log4j;

function getSloc (arr, name) {
	for(var k=0;k<arr.length;k++){
		if(name === arr[k].name)
			return arr[k].log_sloc;
	}
}

function isPresent(Parent, name){
	for(var p=0;p<Parent.children.length;p++){
		if(Parent.children[p].name === name){
			return Parent.children[p];
		}
	}
	return null;
}

function sortArray (arr) {
	var allDirs = [];
	var allFiles = [];
	for(var p=0;p<arr.length;p++){
		if(arr[p].isDir) 
			allDirs.push(arr[p]);
		else 
			allFiles.push(arr[p]);
	}
	
	//sort alphabetically
	allDirs.sort(function(a, b){
	    var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
	    if (nameA < nameB) //sort string ascending
	        return -1 
	    if (nameA > nameB)
	        return 1
	    return 0 //default return value (no sorting)
	});

	allFiles.sort(function(a, b){
	    var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
	    if (nameA < nameB) //sort string ascending
	        return -1 
	    if (nameA > nameB)
	        return 1
	    return 0 //default return value (no sorting)
	});

	arr = [];
	for(var p=0;p<allDirs.length;p++)
		arr.push(allDirs[p]);
	for(var p=0;p<allFiles.length;p++)
		arr.push(allFiles[p]);
	return arr;
}

function sort (root) {
	if(root.children.length === 0) return root;
	root.children = sortArray(root.children);
	for(var h=0;h<root.children.length;h++){
		root.children[h] = sort(root.children[h]);
	}
	return root;
}

function highestNumberOfChildren (root) {
	if(root.children.length === 0)
		return 0;
	var max = 0;
	for(var j=0;j<root.children.length;j++){
		var val = highestNumberOfChildren(root.children[j]);
		if(val>max)
			max = val;
	}
	return Math.max(root.children.length, max);
}

app.get('/', (req, res) => {
	console.log('came here');
	all_files_2_2 = [];
	all_files_2_7 = [];
	sloc_2_2 = [];
	sloc_2_7 = [];
	apache_log4j = new file();
	apache_log4j.name = "apache_log4j";
	apache_log4j.isDir = true;
	apache_log4j.isFile = false;
	apache_log4j.file_path = "apache_log4j";

	fs.readFile('./apache-log4j-2.2-src_directories.dot', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var file_in_string = data.toString();
		var matches = file_in_string.match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"\[.*?>>\];/g);
		fs.readFile('TOTAL_outfile_2_2.txt', 'utf8', function (err, data) {
			var outfile = data.toString();
			var lines = data.match(/.*?\.java/g);
			for(var j=0;j<lines.length;j++){
				//14 - file name
				//10 - logical sloc
				//11 - physical sloc
				//similarly any parameter can be extracted
				//sample array structure - ["20","0","|","19","0","|","1","0","0","|","1","1","|","CODE","/home/cs578user/Desktop/RecProjects/apache-log4j/apache-log4j-2.2-src/log4j-slf4j-impl/src/main/java/org/slf4j/impl/package-info.java"]

				var split_line = lines[j].trim().split(/[ \n\t\r]+/g);
				sloc_2_2.push({
					name: split_line[14].substring(70, split_line[14].length),
					log_sloc: split_line[10],
					phys_sloc: split_line[11]
				});
			}

			for(var i=0;i<matches.length;i++){
				var file_path = (matches[i]).match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"/g);
				var abs_file_path = file_path[0].substring(1, file_path[0].length-1).toString();
				var matches_for_square_brackets = (matches[i]).match(/\[.*?>>\]/g);
				var concern = (matches_for_square_brackets[0]).match(/\<td bgcolor\=\".*?\"\>1\<\/td\>/g);
				var concern_color = (concern[0]).match(/(red|green|yellow|blue|chocolate2|aquamarine|black)/g);
				var file_size = (matches_for_square_brackets[0]).match(/\<td port\=\".*?\"\>[0-9]+?\<\/td\>/g);
				var file_size_bytes = file_size[0].match(/[0-9]+/g);
				var file_name = (matches_for_square_brackets[0]).match(/\<td colspan\=\".*?\"\>.*?\<\/td\>/g);
				var file_name_text = (file_name[0]).match(/[a-zA-Z0-9\-/\.\_]+/g);
				var java_file_name = file_name_text[3]+'.java';
				var concern_name = concern_color_mapping[concern_color[0]];

				var new_file = new file();
				new_file.name = java_file_name;
				new_file.file_path = abs_file_path;
				new_file.isDir = false;
				new_file.isFile = true;
				new_file.sloc = getSloc(sloc_2_2, abs_file_path);
				new_file.file_size = file_size_bytes[1];
				new_file.version = "2.2";
				new_file.isInA = true;
				new_file.concern_color = concern_color[0];
				new_file.concern_name = concern_name;
				new_file.children = [];
				new_file.parent_name = abs_file_path.split("/")[abs_file_path.split("/").length-2];
				all_files_2_2.push(new_file);
			}

			fs.readFile('./apache-log4j-2.7-src_directories.dot', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				var file_in_string = data.toString();
				var matches = file_in_string.match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"\[.*?>>\];/g);
				fs.readFile('TOTAL_outfile_2_7.txt', 'utf8', function (err, data) {
					var outfile = data.toString();
					var lines = data.match(/.*?\.java/g);
					for(var j=0;j<lines.length;j++){
						//14 - file name
						//10 - logical sloc
						//11 - physical sloc
						//similarly any parameter can be extracted
						//sample array structure - ["20","0","|","19","0","|","1","0","0","|","1","1","|","CODE","/home/cs578user/Desktop/RecProjects/apache-log4j/apache-log4j-2.2-src/log4j-slf4j-impl/src/main/java/org/slf4j/impl/package-info.java"]

						var split_line = lines[j].trim().split(/[ \n\t\r]+/g);
						sloc_2_7.push({
							name: split_line[14].substring(70, split_line[14].length),
							log_sloc: split_line[10],
							phys_sloc: split_line[11]
						})	
					}

					for(var i=0;i<matches.length;i++){
						var file_path = (matches[i]).match(/\"[a-zA-Z0-9\-/\.\_]+?\.java\"/g);
						var abs_file_path = file_path[0].substring(1, file_path[0].length-1).toString();
						var matches_for_square_brackets = (matches[i]).match(/\[.*?>>\]/g);
						var concern = (matches_for_square_brackets[0]).match(/\<td bgcolor\=\".*?\"\>1\<\/td\>/g);
						var concern_color = (concern[0]).match(/(red|green|yellow|blue|chocolate2|aquamarine|black)/g);
						var file_size = (matches_for_square_brackets[0]).match(/\<td port\=\".*?\"\>[0-9]+?\<\/td\>/g);
						var file_size_bytes = file_size[0].match(/[0-9]+/g);
						var file_name = (matches_for_square_brackets[0]).match(/\<td colspan\=\".*?\"\>.*?\<\/td\>/g);
						var file_name_text = (file_name[0]).match(/[a-zA-Z0-9\-/\.\_]+/g);
						var java_file_name = file_name_text[3]+'.java';
						var concern_name = concern_color_mapping[concern_color[0]];

						var new_file = new file();
						new_file.name = java_file_name;
						new_file.file_path = abs_file_path;
						new_file.isDir = false;
						new_file.isFile = true;
						new_file.sloc = getSloc(sloc_2_7, abs_file_path);
						new_file.file_size = file_size_bytes[1];
						new_file.version = "2.7";
						new_file.isInB = true;
						new_file.concern_color = concern_color[0];
						new_file.concern_name = concern_name;
						new_file.children = [];
						new_file.parent_name = abs_file_path.split("/")[abs_file_path.split("/").length-2];
						all_files_2_7.push(new_file);
					}

					//construct the tree

					for(var q=0;q<all_files_2_2.length;q++){
						var abs_path = all_files_2_2[q].file_path;
						var abs_path_arr = abs_path.trim().split("/");
						var Parent = apache_log4j;
						var pathsofar = "";
						for(var m=0;m<abs_path_arr.length-1;m++){
							pathsofar = (pathsofar === "") ? abs_path_arr[m] : pathsofar+'/'+abs_path_arr[m];
							if(isPresent(Parent, abs_path_arr[m])){
								Parent = isPresent(Parent, abs_path_arr[m]);
								Parent.isInA = true;
							}
							else {
								var new_file = new file();
								new_file.name = abs_path_arr[m];
								new_file.isDir = true;
								new_file.isFile = false;
								new_file.version = "2.2";
								new_file.isInA = true;
								new_file.parent_name = Parent.name;
								new_file.file_path = Parent.parent_name!=null ? (Parent.file_path+'/'+abs_path_arr[m]) : abs_path_arr[m];
								Parent.children.push(new_file);
								Parent = new_file;
							}
						}
						Parent.children.push(all_files_2_2[q]);
					}

					// for(var q=0;q<all_files_2_7.length;q++){
					// 	var abs_path = all_files_2_7[q].file_path;
					// 	var abs_path_arr = abs_path.trim().split("/");
					// 	var Parent = apache_log4j;
					// 	var pathsofar = "";
					// 	for(var m=0;m<abs_path_arr.length-1;m++){
					// 		pathsofar = (pathsofar === "") ? abs_path_arr[m] : pathsofar+'/'+abs_path_arr[m];
					// 		if(isPresent(Parent, abs_path_arr[m])){
					// 			Parent = isPresent(Parent, abs_path_arr[m]);
					// 			Parent.isInB = true;
					// 		}
					// 		else {
					// 			var new_file = new file();
					// 			new_file.name = abs_path_arr[m];
					// 			new_file.isDir = true;
					// 			new_file.isFile = false;
					// 			new_file.version = "2.7";
					// 			new_file.isInB = true;
					// 			new_file.parent_name = Parent.name;
					// 			new_file.file_path = Parent.parent_name!=null ? (Parent.file_path+'/'+abs_path_arr[m]) : abs_path_arr[m];
					// 			Parent.children.push(new_file);
					// 			Parent = new_file;
					// 		}
					// 	}
					// 	Parent.children.push(all_files_2_7[q]);
					// }
					apache_log4j = sort(apache_log4j);
					//console.log(JSON.stringify(apache_log4j));
					//res.status(200).send(JSON.stringify(apache_log4j));	
					
					console.log(highestNumberOfChildren(apache_log4j));

					fs.writeFile('apache_log4j.json', JSON.stringify(apache_log4j), function (err) {
					  if (err)
					      console.log(err);
					  res.render('index.html');
					  //res.render('pie.html');
					});

					//now, apache_log4j has everything!
				});
			});
		});
	});
});

// set up our express application
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('views', __dirname + '/views');
app.use(express.static(__dirname ));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html'); // set up ejs for templating

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
