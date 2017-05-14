var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var esprima = require('esprima');
var estraverse = require('estraverse');
var readfiles = require('node-readfiles');
var getTree = require('./index');
var graphviz = require('graphviz');
var graph=require('graph-data-structure');
var iqr = require( 'compute-iqr' );
var stats = require("stats-analysis");
var et = require('elapsed-timer');

//my imports
var updateExports = require("./updateExports");
var updateImports = require("./updateImports");
var updateOccurrences = require("./updateOccurrences");
var calculateCdegree = require("./calculateCdegree");
var stack = require("./stack");
var updateUnusedInterfaces = require("./updateUnusedInterfaces");
var prepareDCPPMatrix = require("./prepareDCPPMatrix");
var calculateCoCouplingIQR = require("./calculateCoCouplingIQR");
var calculateCoCouplingMAD = require("./calculateCoCouplingMAD");
var findDFS = require("./findDFS");
//var runBayes = require("./bayes_test");

var g1=graph();
var g = graphviz.digraph("G");
g.set("size", "10,8.5");
g.set("ratio", "fill");

//call the other script and get the directory object
var input_path = "test";
if(!(process.argv[2]))
	console.log("Please specify an appropriate input path");
else
	if(!process.argv[2].length)
		console.log("Please specify an appropriate input path");
	else{
		input_path = process.argv[2].split("/")[process.argv[2].split("/").length-2];
		console.log(input_path)
		getTree(process.argv[2], handleTree);
	}



	function writeFile(path, contents, cb) {
		mkdirp(getDirName(path), function (err) {
			if (err) return cb(err);

			fs.writeFile(path, contents, cb);
		});
	}

	function printExportsImportsOccurrences(root) {
		if (!root) return;
		console.log(root.file_path)
		if (root.isFile) {
        //console.log(root.exports_list);
        //console.log(root.imports_list);
        //console.log(root.occurrences);
        //console.log(root.cdegree);
        console.log(root.interface_usage);
    }
    for (var i = 0; i < root.children.length; i++)
    	printExportsImportsOccurrences(root.children[i]);
}

var allFiles = [];

function storeAllFiles(root){
	if (root.isFile) {
		allFiles.push(root);
		return;
	}
	if (root.isDir) {
		for (var i = 0; i < root.children.length; i++) {
			storeAllFiles(root.children[i]);
		}
		return;
	}
}

var unused_interfaces = [];

var dcpp_matrix = [];
var dcpp_all_values = [];

function getDCPPValues(){
	var output = "";
	for(var i=0;i<dcpp_matrix.length;i++){
		output = output+"\n"+JSON.stringify(dcpp_matrix[i]);
	}
	return output;
}

var cocoupling_iqr = [], cocoupling_mad = [];

function handleTree(root) {
    //your code goes here
    console.log("\n\nProgress:")

    //runBayes('./skv_concerns/', root);

    //extract exports and store them
    //console.log(root.children.length)
    var total_time = new et.Timer("total_time");
    total_time.start();

    root = updateExports(root);

    //next task of extracting imports, storing them
    root = updateImports(root, g, g1);

    //find occurrences
    root = updateOccurrences(root);

    storeAllFiles(root);
    //console.log(allFiles.length)

    //calculate cdegree
    root = calculateCdegree(root, allFiles);

    findDFS(g1, input_path);

    //console.log(g.to_dot());
    writeFile(path.join(__dirname, "./output/"+input_path+"/dot_result.dot"), g.to_dot(), function(err) {
    	if(err) {
    		return console.log(err);
    	}

    	console.log("Dot File was saved");
    });

    //printExportsImportsOccurrences(root);

    updateUnusedInterfaces(root, unused_interfaces);
    //console.log("unused_interfaces: "+unused_interfaces.length);
    writeFile(path.join(__dirname, "./output/"+input_path+"/unused_interfaces.txt"), JSON.stringify(unused_interfaces, null, 4), function(err) {
    	if(err) {
    		return console.log(err);
    	}

    	console.log("Unused Interfaces was saved");
    });


    prepareDCPPMatrix(root, dcpp_matrix, dcpp_all_values);
    writeFile(path.join(__dirname, "./output/"+input_path+"/dcpp_matrix.txt"), getDCPPValues(), function(err) {
    	if(err) {
    		return console.log(err);
    	}

    	console.log("DCPP Matrix was saved");
    });

    //console.log("dcpp: "+dcpp_all_values.length);
    //console.log(dcpp_all_values)

    var iqr_value = 1.5*iqr( dcpp_all_values );
    //console.log("\nIQR_value: "+iqr_value);
    //console.log("----IQR----")    
    calculateCoCouplingIQR(root, iqr_value, cocoupling_iqr);
    writeFile(path.join(__dirname, "./output/"+input_path+"/cocoupling_iqr.txt"), JSON.stringify(cocoupling_iqr, null, 4), function(err) {
    	if(err) {
    		return console.log(err);
    	}

    	console.log("Cocoupling IQR was saved");
    });

    var mad_value = 2*stats.MAD( dcpp_all_values );
    //console.log("MAD_value: "+mad_value);
    //console.log("----MAD----")
    calculateCoCouplingMAD(root, mad_value, cocoupling_mad);
    writeFile(path.join(__dirname, "./output/"+input_path+"/cocoupling_mad.txt"), JSON.stringify(cocoupling_mad, null, 4), function(err) {
    	if(err) {
    		return console.log(err);
    	}

    	console.log("Cocoupling MAD was saved");
    });
    
    g.output( "png", path.join(__dirname, "./output/"+input_path+"/dot_graph.png"), function(err){

    });
    total_time.end();
    //console.log("Total time taken: "+total_time.diff()/1000000);
}
