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

function getLength(x){
  var count=0;
  for(var key in x){
    if(x.hasOwnProperty(key))
      count++;
  }
  return count++;
}

function calculateCoCouplingMAD(root, threshold, cocoupling_mad){
    if (root.isFile) {
        var values = [];
        var obj = {
            module: root.file_path,
            smells: {}
        };
        for(var key in root.cdegree)
            if(root.cdegree.hasOwnProperty(key)){
                //console.log(root.cdegree[key]+" > "+threshold)
                if(root.cdegree[key] > threshold){
                    obj.smells[key] = root.cdegree[key];
                    //console.log("came here mad")
                }
                    
            }
        if(getLength(obj.smells))
            cocoupling_mad.push(obj);
        return;
    }
    if (root.isDir) {
        for (var i = 0; i < root.children.length; i++) {
            calculateCoCouplingMAD(root.children[i], threshold, cocoupling_mad);
        }
        return;
    }
}

module.exports = calculateCoCouplingMAD;