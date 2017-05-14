var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var esprima = require('esprima');
var estraverse = require('estraverse');
var readfiles = require('node-readfiles');
var et = require('elapsed-timer');

function file () {
    this.name = "",
    this.parent_name = null,
    this.file_path = "",
    this.isDir = false,
    this.isFile = true,
	this.AST = [],
    this.content = "",
    this.occurrences = {},
    this.imports_list = {},
    this.exports_list = [],
    this.cdegree = {},
    this.interface_usage = {},
    this.children = []
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

function isPresent(Parent, name){
    for(var p=0;p<Parent.children.length;p++){
        if(Parent.children[p].name === name){
            return Parent.children[p];
        }
    }
    return null;
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

function printAllFileNames (root) {
	if(!root) return;
	console.log(root.file_path)
	for(var i=0; i<root.children.length;i++)
		printAllFileNames(root.children[i]);
}

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}

function getAllFiles(root, output){
	if(root.isFile)
        return root.file_path
    if(root.isDir){
        for(var i=0; i<root.children.length;i++)
		    output += getAllFiles(root.children[i])+"\n";
        return output;
    }
}

var project_dir = new file();
project_dir.name = "project_home";
project_dir.isDir = true;
project_dir.isFile = false;
project_dir.file_path = "project_home";
var js_files = 0;
module.exports = function(dir_path, callback){
	var timer = new et.Timer("fileread");
    timer.start();
    readfiles(dir_path, {
        //filter: '*.*',
        //depth: 100
    }, function (err, filename, content) {
	    
        //console.log('File ' + filename + ':');
        //console.log(esprima.parse(content, {sourceType: 'module'}));
        //console.log(content.length);
        if (err) {
            //console.log('File ' + filename + ': '+err.toString());
        }
        
        if(!err && filename.toString().indexOf(".js")===filename.toString().length-3){
            js_files++;
            try{
                esprima.parse(content, {sourceType: 'module'});
            } catch(err) { 
                //console.log('File ' + filename + ': '+err.toString());
                return;
            }
            var abs_path = filename;
            var abs_path_arr = abs_path.trim().split("/");
            var Parent = project_dir;
            var pathsofar = "";
            //only looping over direcories in the path, and not the file
            //file is being insterted after the loop
            for(var m=0; m<abs_path_arr.length-1 ; m++){
                pathsofar = (pathsofar === "") ? abs_path_arr[m] : pathsofar+'/'+abs_path_arr[m];
                if(isPresent(Parent, abs_path_arr[m])){
                    Parent = isPresent(Parent, abs_path_arr[m]);
                }
                else {
                    var new_file = new file();
                    new_file.name = abs_path_arr[m];
                    new_file.isDir = true;
                    new_file.isFile = false; 
                    new_file.parent_name = Parent.name;
                    //new_file.file_path = Parent.parent_name!=null ? (Parent.file_path+'/'+abs_path_arr[m]) : abs_path_arr[m];
                    new_file.file_path = Parent.file_path+'/'+abs_path_arr[m];
                    //this is just a directory
                    //new_file.AST = esprima.parse(fs.readFileSync(content.toString(), 'utf-8').toString(), {sourceType: 'module'});
                    Parent.children.push(new_file);
                    Parent = new_file;
                }
            }
            var actual_file = new file();
            actual_file.name = abs_path_arr[abs_path_arr.length-1];
            actual_file.parent_name = Parent.name;
            //actual_file.file_path = Parent.parent_name!=null ? (Parent.file_path+'/'+abs_path_arr[abs_path_arr.length-1]) : abs_path_arr[abs_path_arr.length-1];
            actual_file.file_path = Parent.file_path+'/'+abs_path_arr[abs_path_arr.length-1];
            actual_file.AST = esprima.parse(content, {sourceType: 'module'});
            actual_file.content = content;
            actual_file.children = [];
            Parent.children.push(actual_file);
        }

	}).then(function (files) {
		//console.log(JSON.stringify(files));
	console.log("")
    //printAllFileNames(project_dir);
    console.log("")
	console.log('Read ' + files.length + ' file(s)');
    console.log('Read ' + js_files + ' JS file(s)');
    timer.end();
    //console.log("Time taken to read files: "+timer.diff()/1000000);
	sort(project_dir)
	
    // var output = "";
    // writeFile(path.join(__dirname, dir_path+"file_manifest.txt"), getAllFiles(project_dir, output), function(err) {
    //         if(err) {
    //             return console.log(err);
    //         }

    //         console.log("Cocoupling MAD was saved");
    // });
    callback(project_dir)
	console.log("")
	//console.log(JSON.stringify(project_dir))
	}).catch(function (err) {
	console.log('Error reading files:', err.message);
	});
};