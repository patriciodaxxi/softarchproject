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

function prepareDCPPMatrix(root, dcpp_matrix, dcpp_all_values){
    if (root.isFile) {
        var values = [];
        for(var key in root.cdegree)
            if(root.cdegree.hasOwnProperty(key)){
                values.push(root.cdegree[key].toFixed(2));
                if(root.cdegree[key])
                    dcpp_all_values.push(root.cdegree[key]);
            }
                
        dcpp_matrix.push(values);
        return;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            prepareDCPPMatrix(root.children[i], dcpp_matrix, dcpp_all_values);
        }
        return;
    }
}

module.exports = prepareDCPPMatrix;