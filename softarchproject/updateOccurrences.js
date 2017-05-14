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

function findOccurrences(root) {
    //find occurrences using imports and AST
    var occurrences = {};
    occurrences["total_count"] = 0;
    estraverse.traverse(root.AST, {
        enter: function (node) {
            var name = "";
            if(node.type === "Identifier")
                name = node.name;
            if (node.type === "CallExpression" || node.type === "NewExpression")
                if (node.callee)
                    if (node.callee.name)
                        name = node.callee.name;

            if (node.type === "MemberExpression")
                if (node.object)
                    if (node.object.name)
                        name = node.object.name;
            var done=false;
            for (var i = 0;!done && name.length > 0 && i < root.imports_list.length; i++) {
                var local_var = root.imports_list[i].local;
                if (name === local_var) {
                    done=true;
                    if (!occurrences[root.imports_list[i].module])
                        occurrences[root.imports_list[i].module] = 1;
                    else
                        occurrences[root.imports_list[i].module]++;
                    //console.log("updated: "+name+", "+occurrences[name]);
                    occurrences["total_count"]++;
                }
            }
        }
    });
    //console.log("");
    //pending - yet to map local variables to absolute path module names
    root.occurrences = occurrences;
    return root;
}

function updateOccurrences(root) {
    if (root.isFile) {
        //console.log("");
        //console.log("begin file: "+root.file_path);
        return findOccurrences(root);
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            root.children[i] = updateOccurrences(root.children[i]);
        }
        return root;
    }
}

module.exports = updateOccurrences;